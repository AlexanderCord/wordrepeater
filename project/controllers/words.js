var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');

const words = async (req, response) => {
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
      for(i=0; i<res.length; i++) {
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

const addWord = async (req, response) => {
  try { 
    let word = await new Vocabulary({original : req.body.original, translation: req.body.translation})
    .save();
  
    console.log(word)
    response.redirect('/vocabulary/words?added');

  } catch(err) {
    // Error handling
    response.render('error', {error:err});
  }
    
}

const word = async (req, response) => {
  try { 
    let query = {"_id": req.params.id};
    let word = await Vocabulary.findOne(query).exec();
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

const updateWord = async (req, response) => {
  try {
    let query = {"_id": req.params.id};
    let update = {original : req.body.original , translation: req.body.translation};
    let options = {new: true};
    let word = await Vocabulary.findOneAndUpdate(query, update, options).exec();
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

const deleteWord = async (req, response) => {
  try {
    let query = {"_id": req.params.id}
    let word = await Vocabulary.findOneAndRemove(query).exec();
    console.log('removing word');
    console.log(word);

    await TrainLog.deleteMany({word_id: req.params.id }).exec();
    
    console.log('removed log');
    response.redirect('/vocabulary/words');
  } catch(err) {
    // Error handling
    response.render('error', {error:err});
  }  
}

module.exports = {words, word, addWord, updateWord, deleteWord};

