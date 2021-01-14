import express from 'express';
import IController from './icontroller';
 

import { Response, Request } from 'express';
// mongoose config
import {Vocabulary, TrainLog} from '../models/database';

import IVocabulary from '../models/ivocabulary';
import ITrainLog from '../models/itrainlog';
import mongoose from 'mongoose';

var ObjectId = require('mongodb').ObjectID;
class WordsController implements IController{
  public path = '/vocabulary';
  public router = express.Router();
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get('/words', this.words);
    this.router.post('/words', this.addWord);
    this.router.get('/word/:id', this.word);
    this.router.put('/word/:id', this.updateWord);
    this.router.delete('/word/:id', this.deleteWord);
  }
  
  private words = async (req: Request, response: Response): Promise<void> => {
    try { 
      let train_stats = [];
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
        }
      },
      {
        $sort: {"train_result_yes": -1 }
      },
      ]).exec();
    
      if(res.length > 0) {
        for(let i=0; i<res.length; i++) {
          train_stats[ res[i]._id.word_id ] = res[i];
          
          train_stats[ res[i]._id.word_id ].success_rate = 0;
          if(res[i].train_result_yes + res[i].train_result_no > 0){
            train_stats[ res[i]._id.word_id ].success_rate = Math.round(100*res[i].train_result_yes/(res[i].train_result_yes + res[i].train_result_no));
          }
          
        }
      }
    
      //console.log(train_stats);
      
      let words = await Vocabulary.find().sort({original: 1}).exec();
      
      //console.log(words)
      response.render(
        'words',
        {title : 'Vocabulary', words : words, train_stats: train_stats}
      );
    
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }
  }
  
  private addWord = async (req: Request, response: Response): Promise<void> => {
    try { 
      let word_original = req.body.original;
      let word_translation = req.body.translation;
      word_original = word_original.toLowerCase().trim();
      word_translation = word_translation.toLowerCase().trim();

      let wordExists: any = await Vocabulary.find({original: word_original}).exec();
      if(wordExists.length && wordExists.length>0) {
        response.redirect('/vocabulary/words#error=Word already exists');
      } else {

        let word = await new Vocabulary({original : word_original, translation: word_translation})
        .save();
    
        console.log(word)
        response.redirect('/vocabulary/words?added');
      }
  
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }
      
  }
  
  private word = async (req: Request, response: Response): Promise<void> => {
    try { 
      let query = {"_id": req.params.id};
      let word: any = await Vocabulary.findOne(query).exec();
      console.log(word)
      response.render(
        'word',
        {title : 'Vocabulary - ' + word.original, word : word}
      );
    
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }  
  }
  
  private updateWord = async (req: Request, response: Response): Promise<void> => {
    try {
      let query = {"_id": req.params.id};
      let update = {original : req.body.original , translation: req.body.translation};
      let options = {new: true};
      let word: any = await Vocabulary.findOneAndUpdate(query, update, options).exec();
      console.log(word)
      response .render(
        'word',
        {title : 'Vocabulary - ' + word.original, word : word}
      );
    
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }  
  }
  
  private deleteWord = async (req: Request, response: Response): Promise<void> => {
    try {
      let query = {"_id": req.params.id}
      let word: any = await Vocabulary.findOneAndRemove(query).exec();
      console.log('removing word');
      console.log(word);
  
      await TrainLog.deleteMany({word_id: ObjectId(req.params.id) }).exec();
      
      console.log('removed log');
      response.redirect('/vocabulary/words?removed');
    } catch(err) {
      // Error handling
      response.render('error', {error:err});
    }  
  }
  
  
}
 
export default WordsController;
 




