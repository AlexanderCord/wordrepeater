import { Response, Request } from 'express'
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');
var ObjectId = require('mongodb').ObjectID;


/*
******************
Train UI
******************
*/

async function saveTrainResult(response: Response, word_id: any, train_result: any): Promise<void> {
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


const startTraining = async (req: Request, res: Response): Promise<void> => {
  res.render('train',
    {title: 'Training', word: []}
  );

}

// Default training mode - Words that you've scored with 90% or less
const defaultTraining = async (req: Request, response: Response): Promise<void> => {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  try {
    await saveTrainResult(response, req.query.word_id, req.query.train_result);
  
    let train_stats : {word_id: String, success_rate: Number}[] = [];
    let stat_count = 0;
    let res = await TrainLog.aggregate([
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
        ratio: { '$lte': 0.9 }
      }
    },
    
    {
      $sort: {"ratio": 1 }
    },
    ]).exec();
  
    if(res.length > 0) {
      for(let i=0; i<res.length; i++) {
        stat_count ++;
        //train_stats[ i ] = {}
        train_stats[ i ].word_id = res[i]._id.word_id
        if(res[i].train_result_yes + res[i].train_result_no > 0){
          train_stats[ i ].success_rate = Math.round(100*res[i].train_result_yes/(res[i].train_result_yes + res[i].train_result_no));
        }
        
      }
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
    let word = await Vocabulary.findOne({ "_id": new_word_id }).exec();
    console.log('word' + word);
    response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation, 'train_stats': train_stats[rnd]  }});

  } catch(err) {
    // Error handling
    response.render('error', {error:err});
  }

}




// Training mode NEW - New words (zero score)
// @todo update word's score in a cache table to avoid memory overload, or using Mongo's lookup
// @todo JSON errors render in JSON format => client-side update
const newWordsTraining = async (req: Request, response: Response): Promise<void> => {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  try {
    // Saving training result for this word
    await saveTrainResult(response, req.query.word_id, req.query.train_result);

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
    let word = await Vocabulary.findOne({"_id": { "$nin" : trained } }).skip(random).exec();
    
    // Sending JSON output
    response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation  }});

  } catch(err) {
    // Error handling
    response.render('error', {error:err});
  }

}

// Training mode all - All words (random order)
const allWordsTraining = async (req: Request, response: Response): Promise<void> => {
  try {
    console.log( req.query.word_id + '=' + req.query.train_result );  
    await saveTrainResult(response, req.query.word_id, req.query.train_result);

    console.log('Training mode = all');
    // Get the count of all words
    let count = await Vocabulary.count().exec();
    // Get a random entry
    var random = Math.floor(Math.random() * count)

    // Again query all words but only fetch one offset by our random #
    let word = await Vocabulary.findOne().skip(random).exec();
    // Tada! random word
    console.log(word) 
    response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation  }});
  
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
const logPage = async (req: Request, response: Response): Promise<void> => {
  try {
    let log = await TrainLog.find().populate('word_id').sort({added: -1}).exec();
    
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


const logFilter = async (req: Request, response: Response): Promise<void> => {
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



const allLog = async (req: Request, response: Response): Promise<void> => {
  
  try {
    let log = await TrainLog.find().populate('word_id').sort({added: -1}).exec();
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

const wordStats = async (req: Request, response: Response): Promise<void> => {
  try{ 
    console.log( req.query.word_id  );  
    console.log('Train stats for one word');  
    let train_stats = [];
    let stat_count = 0;
    let res = await TrainLog.aggregate([
    {
      $match: {
        word_id: ObjectId(req.query.word_id)
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
        "train_result_yes" : "$train_result_yes",
        "train_result_no" : "$train_result_no",
        ratio : {
          $divide : [ "$train_result_yes", { $add: [ "$train_result_yes", "$train_result_no" ] } ]
        } 
      } 
    },
    ]).exec();
  
    response.json({'result' : { 'train_stats': res  }});

  } catch(err) {
    // Error handling
    response.render('error', {error:err});
  }


}


module.exports = {
  startTraining,
  defaultTraining,
  newWordsTraining,
  allWordsTraining,
  logPage,
  logFilter,
  allLog,
  wordStats
};

