import * as express from 'express';
import IController from './icontroller';

import { Response, Request } from 'express';
// mongoose config
import {Vocabulary, TrainLog} from '../models/database';

import IVocabulary from '../models/ivocabulary';
import ITrainLog from '../models/itrainlog';
import mongoose, { Mongoose } from 'mongoose';
import moment from 'moment';

var ObjectId = require('mongodb').ObjectID;


class TrainController implements IController{
  public path = '/train';
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get('/start', this.startTraining);

    // Default training mode - Words that you've scored with 90% or less
    this.router.get('/default', this.defaultTraining);
    
    
    
    // Training mode NEW - New words (zero score)
    // @todo update word's score in a cache table to avoid memory overload, or using Mongo's lookup
    // @todo JSON errors render in JSON format => client-side update
    this.router.get('/new', this.newWordsTraining);
    
    
    // Training mode all - All words (random order)
    this.router.get('/all', this.allWordsTraining);
    
    
    /*
    ******************
    Log UI
    ******************
    */
    this.router.get('/log', this.logPage);
    
    
    this.router.get('/log/filter', this.logFilter);
    
    this.router.get('/log/all', this.allLog);    
    
    this.router.get('/stats', this.wordStats);

    this.router.get('/log/days_trained', this.daysTrained);

    this.router.get('/statistics', this.statistics);
    
    //this.router.get('/log/data/days_trained_no', this.daysTrainedNo);
        
  }

  
  // @todo refactor to model
  private getStatisticQuery = (ratioSort: number, filter_date_from: Date, filter_date_to: Date ) => {
    
    console.log(filter_date_from);
    console.log(filter_date_to);
    return [
      
      {
         $match: {
           'added': { 
             $gte: filter_date_from, 
             $lte: filter_date_to
            }
 
         }
 
       },         

     {
       $group: {
         "_id": {
           "word_id": "$word_id"
         },
         train_result_yes: {
           $sum: {
             $cond: {
               if: {
                 $eq: [
                   "$train_result",
                   true
                 ]
               },
               then: 1,
               else: 0
             }
           }
         },
         train_result_no: {
           $sum: {
             $cond: {
               if: {
                 $eq: [
                   "$train_result",
                   false
                 ]
               },
               then: 1,
               else: 0
             }
           }
         }
       },
     },


     {
       $project : {
         _id : "$_id",
         ratio : {
           $divide : [ "$train_result_yes", { $add: [ "$train_result_yes", "$train_result_no" ] } ]
         },
         total_trained : {
           $add: [ "$train_result_yes", "$train_result_no" ] 
         },
         "train_result_yes" : "$train_result_yes",
         "train_result_no" : "$train_result_no",
       } 
     },      
     
     {
       $sort: {"ratio": ratioSort, "total_trained": -1 }
     },
     {
      $match: {
        ratio: { '$gt': 0 },
      }
    },
    ];

  }

  private statistics = async (req: Request, response: Response): Promise<void> => {
    try { 
      // @todo - reafctoring - move train stats method to separate model
      
      let filter_date_from: any = req.query.date_from;
      let filter_date_to: any = req.query.date_to;
      if(!filter_date_from) {
        filter_date_from = moment().subtract(30, 'days').toDate();
      } else {
        filter_date_from = moment(filter_date_from, "YYYY-MM-DD").toDate();
      }
      //let date_from = moment(filter_date_from, "YYYY-MM-DD").toDate();
      //let date_to = moment(filter_date_to, "YYYY-MM-DD").toDate();

      if(!filter_date_to) {
        filter_date_to = moment().toDate();
      } else {
        filter_date_to = moment(filter_date_to, "YYYY-MM-DD").toDate();

      }

      let trainStatBest = await TrainLog.aggregate(this.getStatisticQuery(-1, filter_date_from, filter_date_to)).limit(100).exec();
      let trainStatWorst = await TrainLog.aggregate(this.getStatisticQuery(1, filter_date_from, filter_date_to)).limit(100).exec();
      /*console.log("top best memorized");
      console.log(resBest);
      console.log("top worst memorized");
      console.log(resWorst);*/
    
      let worstIDs = [];
      let bestIDs = []
      if(trainStatBest.length > 0) {
        for(let i=0; i<trainStatBest.length; i++) {
          trainStatBest[i].success_rate = Math.round(trainStatBest[i].ratio * 100)
          bestIDs[bestIDs.length] = trainStatBest[i]._id.word_id;
        }
      } else{
        
        throw new Error('No trained words found');
      }

      if(trainStatWorst.length > 0) {
        for(let i=0; i<trainStatWorst.length; i++) {
          trainStatWorst[i].success_rate = Math.round(trainStatWorst[i].ratio * 100)
          worstIDs[worstIDs.length] = trainStatWorst[i]._id.word_id;
        }
      } else{
        
        throw new Error('No trained words found');
      }
    
    
      //console.log(train_stats);
      
      let bestWords = await Vocabulary.find({_id: bestIDs}).exec();
      let worstWords = await Vocabulary.find({_id: worstIDs}).exec();
      let bestWordsAssoc: { [key: string]: IVocabulary & mongoose.Document } = {};
      let worstWordsAssoc: { [key: string]: IVocabulary & mongoose.Document } = {};

      if(bestWords.length > 0) {
        for(let i=0; i<bestWords.length; i++) {
          bestWordsAssoc[ bestWords[i].id ] = bestWords[i];
        }
      }
      if(worstWords.length > 0) {
        for(let i=0; i<worstWords.length; i++) {
          worstWordsAssoc[ worstWords[i].id ] = worstWords[i];
        }
      }     

      response.render(
        'statistics',
        {title : 'Statistics', bestWords : bestWordsAssoc, worstWords: worstWordsAssoc, trainStatBest: trainStatBest, trainStatWorst: trainStatWorst,
      'filter_date_from': moment(filter_date_from).format('YYYY-MM-DD').toString(), 
      'filter_date_to': moment(filter_date_to).format('YYYY-MM-DD').toString() }
      );
    
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }
  }

  /*
  ******************
  Train UI
  ******************
  */

  private async saveTrainResult(response: Response, word_id: any, train_result: any): Promise<void> {
    if(train_result == "skip") {
      console.log("Train log skipped");
    } else {
    
      try {
        await new TrainLog({
          word_id : ObjectId(word_id),
          train_result: train_result == "yes" ? true : false
        }).save();
        console.log('train log added');

      } catch(err) {
        // @todo refactor when everything is one-style
        if(response) {
          response.render('error', {error:err});
        } else {
          console.log('test exception escalation');
          throw err;
        }
      }
    }
  }


  private startTraining = async (req: Request, res: Response): Promise<void> => {
    res.render('train',
      {title: 'Training', word: []}
    );

  }

  // Default training mode - Words that you've scored with 90% or less
  private defaultTraining = async (req: Request, response: Response): Promise<void> => {
    console.log( req.query.word_id + '=' + req.query.train_result + '; ' + req.query.filter_date_from + ' - ' + req.query.filter_date_to);  
    try {

      await this.saveTrainResult(response, req.query.word_id, req.query.train_result);

      let filter_date_from: any = req.query.date_from;
      let filter_date_to: any = req.query.date_to;
      let date_from = moment(filter_date_from, "YYYY-MM-DD").toDate();
      let date_to = moment(filter_date_to, "YYYY-MM-DD").toDate();
      console.log(date_from);
      console.log(date_to);

      let train_method_original: any = req.query.method_original;

      let train_stats : {word_id: any, success_rate: Number}[] = [];
      let stat_count = 0;
      let res = await TrainLog.aggregate([
        {
          $match: {
            'added': { 
              $gte: date_from, 
              $lte: date_to
             }
  
          }
  
        },         

      {
        $group: {
          "_id": {
            "word_id": "$word_id"
          },
          train_result_yes: {
            $sum: {
              $cond: {
                if: {
                  $eq: [
                    "$train_result",
                    true
                  ]
                },
                then: 1,
                else: 0
              }
            }
          },
          train_result_no: {
            $sum: {
              $cond: {
                if: {
                  $eq: [
                    "$train_result",
                    false
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        },
      },


      {
        $project : {
          _id : "$_id",
          ratio : {
            $divide : [ "$train_result_yes", { $add: [ "$train_result_yes", "$train_result_no" ] } ]
          } 
        } 
      },
      {
        $match: {
          ratio: { '$lte': 0.9 },
        }
      },
      
      {
        $sort: {"ratio": 1 }
      },
      ]).exec();
      
    
      if(res.length > 0) {
        for(let i=0; i<res.length; i++) {
          stat_count ++;
          train_stats[ i ] = {word_id: "", success_rate: 0}
          train_stats[ i ].word_id = res[i]._id.word_id
          if(res[i].train_result_yes + res[i].train_result_no > 0){
            train_stats[ i ].success_rate = Math.round(100*res[i].train_result_yes/(res[i].train_result_yes + res[i].train_result_no));
          }
          
        }
      } else{
        
        throw new Error('No words found');
      }

      // @todo refactor callbacks
      // Loading random word from those where user haven't trained yet or success rate is low
      let min = 0;
      let max = stat_count>0 ? stat_count - 1: 0;
      console.log("Max" + stat_count);
      let rnd = Math.floor(Math.random() * (max - min + 1)) + min;
      let new_word_id = train_stats[ rnd ].word_id;
      console.log('Training mode = default');

      console.log('New word id' + new_word_id);
      console.log('rnd' + rnd);
      let word: any = await Vocabulary.findOne({ "_id": new_word_id }).exec();
      console.log('word' + word);
      if(train_method_original === "true") {
        response.json({'result' : {'word_original': word.translation, 'word_id' : word.id, 'word_translation' : word.original, 'train_stats': train_stats[rnd]  }});
      } else {
        response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation, 'train_stats': train_stats[rnd]  }});

      }

    } catch(err) {
      console.log(err)
      // Error handling
      response.json({'error': err.message});
    }

  }




  // Training mode NEW - New words (zero score)
  // @todo update word's score in a cache table to avoid memory overload, or using Mongo's lookup
  // @todo JSON errors render in JSON format => client-side update
  private newWordsTraining = async (req: Request, response: Response): Promise<void> => {
    console.log( req.query.word_id + '=' + req.query.train_result );  

    try {

      // Saving training result for this word
      await this.saveTrainResult(response, req.query.word_id, req.query.train_result);

      let train_method_original: any = req.query.method_original;

      console.log('Training mode: new')

      // Loading word_ids for already trained words
      let train_stats = [];
      let stat_count = 0;
      
      let trained_temp = await TrainLog.distinct('word_id').exec()
      let trained = [];
      for(let i = 0; i< trained_temp.length;i++){
        trained[i] = ObjectId(trained_temp[i]);
      }
      console.log("Trained: " + trained_temp.length);
      console.log(trained_temp);
      console.log('Trained first' + trained);
      
      // Loading count of words, excluding word_ids of trained ones
      let count = await Vocabulary.find({"_id": { "$nin" : trained } }).count().exec();
      
      // Get a random entry
      let random = Math.floor(Math.random() * count);
      console.log('random' + random);
      console.log('Trained second' + trained[0]);

      // Loading a radom word    
      let word: any = await Vocabulary.findOne({"_id": { "$nin" : trained } }).skip(random).exec();
      
      // Sending JSON output
      if(train_method_original === "true") {
        response.json({'result' : {'word_original': word.translation, 'word_id' : word.id, 'word_translation' : word.original   }});
      } else {
        response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation   }});
      }


    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }

  }

  // Training mode all - All words (random order)
  private allWordsTraining = async (req: Request, response: Response): Promise<void> => {
    try {

      console.log( req.query.word_id + '=' + req.query.train_result );  
      await this.saveTrainResult(response, req.query.word_id, req.query.train_result);

      let train_method_original: any = req.query.method_original;

      console.log('Training mode = all');
      // Get the count of all words
      let count = await Vocabulary.count({}).exec();
      // Get a random entry
      var random = Math.floor(Math.random() * count)

      // Again query all words but only fetch one offset by our random #
      let word: any = await Vocabulary.findOne().skip(random).exec();
      // Tada! random word
      console.log(word) 
      if(train_method_original === "true") {
        response.json({'result' : {'word_original': word.translation, 'word_id' : word.id, 'word_translation' : word.original   }});
      } else {
        response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation   }});
      }
    
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }
    
    
  }




  /*
  ******************
  Log UI
  ******************
  */
  private logPage = async (req: Request, response: Response): Promise<void> => {
    try {
      let log = await TrainLog.find().populate('word_id').sort({added: -1}).limit(100).exec();
      
      const util = require('util');
      console.log(util.inspect(log, false, null));
      response.render(
        'log',
        {title : 'Training Log', log : log}
      );

    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }


  }


  private logFilter = async (req: Request, response: Response): Promise<void> => {
    try {
      let filter_date = req.query.date;
      console.log(filter_date);
      const moment = require('moment');
    
      let filter_date_from = moment(filter_date, "YYYY-MM-DD").utc();
      let filter_date_to = moment(filter_date, "YYYY-MM-DD").add('days', 1).utc();
      console.log(filter_date_from);
      console.log(filter_date_to);

      let log = await TrainLog.find({
        added: {"$gte" : filter_date_from, "$lt" : filter_date_to}
        }).populate('word_id').sort({added: -1}).exec();
        
      const util = require('util');
      console.log(util.inspect(log, false, null));
      response.json({
    'result' : {'log' : log}
      });

    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }


  }



  private allLog = async (req: Request, response: Response): Promise<void> => {
    
    try {
      let log = await TrainLog.find().populate('word_id').sort({added: -1}).limit(100).exec();
      const util = require('util');
      console.log(util.inspect(log, false, null));
      response.json({
    'result' : {'log' : log}
      });
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }

    
  }

  private wordStats = async (req: Request, response: Response): Promise<void> => {
    try{ 
      console.log( req.query.word_id  );  
      console.log('Train stats for one word');  

      let filter_date_from: any = req.query.date_from;
      let filter_date_to: any = req.query.date_to;
      var lookupClause = {
        $match: {
          word_id: ObjectId(req.query.word_id),          
        }
        
      };
      var lookupFilter: any = false;
      if(filter_date_from && filter_date_to) {
        let date_from = moment(filter_date_from, "YYYY-MM-DD").toDate();
        let date_to = moment(filter_date_to, "YYYY-MM-DD").toDate();
        console.log(date_from);
        console.log(date_to);
        lookupFilter = {
          $match: {
            word_id: ObjectId(req.query.word_id),
            added: { 
              $gte: date_from, 
              $lte: date_to
            }
          }
          
        };
      } 
      if(lookupFilter) {
        lookupClause = lookupFilter;
      }
      let train_stats = [];
      let stat_count = 0;
      var statQuery = [
      lookupClause,
      {
        $group: {
          "_id": {
            "word_id": "$word_id"
          },
          train_result_yes: {
            $sum: {
              $cond: {
                if: {
                  $eq: [
                    "$train_result",
                    true
                  ]
                },
                then: 1,
                else: 0
              }
            }
          },
          train_result_no: {
            $sum: {
              $cond: {
                if: {
                  $eq: [
                    "$train_result",
                    false
                  ]
                },
                then: 1,
                else: 0
              }
            }
          }
        },
      },

      {
        $project : {
          _id : "$_id",
          "train_result_yes" : "$train_result_yes",
          "train_result_no" : "$train_result_no",
          ratio : {
            $divide : [ "$train_result_yes", { $add: [ "$train_result_yes", "$train_result_no" ] } ]
          } 
        } 
      }];
      console.log(statQuery);
      let res = await TrainLog.aggregate(statQuery).exec();
    
      response.json({'result' : { 'train_stats': res  }});

    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }


  }  


  private getTrainDataByDays = async(filter_date_from: any, filter_train_result: any): Promise<ITrainLog & mongoose.Document> => {
    return await TrainLog.aggregate([
      {
        $match: {
          "train_result": {$in : filter_train_result},
          "added": {
            $gt: filter_date_from
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$added"
            }
          },
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          "_id": 1
        }
      }
    ]).exec();  
  }

  private daysTrained = async (req: Request, response: Response): Promise<void> => {
    try{ 
      
      console.log('Log data grouped by date with YES responses');  
      const moment: any = require('moment');
    
      let filter_date_from = moment().subtract(90, 'days').toDate();     


      let dataAll = await this.getTrainDataByDays(filter_date_from, [true, false])
      let dataYes = await this.getTrainDataByDays(filter_date_from, [true])
      let dataNo = await this.getTrainDataByDays(filter_date_from, [false])
      

      
      response.json({'result' : { 'data_all': dataAll, 'data_yes': dataYes, 'data_no': dataNo  }});

    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }


  }    
}



export default TrainController;




