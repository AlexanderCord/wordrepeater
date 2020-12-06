var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');


router.get('/start', function(req, res) {
  // Get the count of all users
  Vocabulary.count().exec(function (err, count) {
    if(err) {
      res.render('error', {error:err});
    }

    // Get a random entry
    var random = Math.floor(Math.random() * count)

    // Again query all users but only fetch one offset by our random #
    Vocabulary.findOne().skip(random).exec(
      function (err, word) {
        if(err) {
          res.render('error', {error:err});
        }
        // Tada! random user
        console.log(word) 
        res.render(
          'train',
          {title: 'Training', word: word}
        );
      })
  })


});


router.get('/next', function(req, response) {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  var ObjectId = require('mongodb').ObjectID;
  new TrainLog({
      word_id : ObjectId(req.query.word_id),
      train_result: req.query.train_result == "yes" ? true : false
      })
    .save(function(err, word) {
      if(err) {
        response.render('error', {error:err});
      }
      console.log('train log added')
    });
  var train_stats = [];
  var stat_count = 0;
  TrainLog.aggregate([
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
  ]).exec( function(err, res) {
    if(err){
      console.log("Error:" + err);
      response.render('error', {error:err});
    }
   
    if(res.length > 0) {
      for(i=0; i<res.length; i++) {
        stat_count ++;
        train_stats[ i ] = {}
        train_stats[ i ].word_id = res[i]._id.word_id
        if(res[i].train_result_yes + res[i].train_result_no > 0){
          train_stats[ i ].success_rate = Math.round(100*res[i].train_result_yes/(res[i].train_result_yes + res[i].train_result_no));
        }
        
      }
    }

    // @todo refactor callbacks
    // Loading random word from those where user haven't trained yet or success rate is low
    min = 0;
    max = stat_count>0 ? stat_count - 1: 0;
    rnd = Math.floor(Math.random() * (max - min + 1)) + min;
    new_word_id = train_stats[ rnd ].word_id;
  
    Vocabulary.count().exec(function (err, count) {
      if(err) {
        console.log("Error" + err);
        response.render('error', {error:err});
      }

      Vocabulary.findOne({"_id": new_word_id})/*.skip(random)*/.exec(
        function (err, word) {
          if(err) {
            console.log("Error:" + err);
            response.render('error', {error:err});
          } 

          response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation, 'train_stats': train_stats[rnd]  }});
        })
    })
  });

});


router.get('/log', function(req, res) {

  TrainLog.find().populate('word_id').sort({added: -1}).exec( function(err, log){
    if(err) {
      res.render('error', {error:err});
    }
    var util = require('util');
    console.log(util.inspect(log, false, null));
    res.render(
      'log',
      {title : 'Training Log', log : log}
    );
  });
});


router.get('/log/filter', function(req, res) {
  filter_date = req.query.date;
  console.log(filter_date);
  var moment = require('moment');
  
  filter_date_from = moment(filter_date, "YYYY-MM-DD").utc();
  filter_date_to = moment(filter_date, "YYYY-MM-DD").add('days', 1).utc();
  console.log(filter_date_from);
  console.log(filter_date_to);

  TrainLog.find({
	added: {"$gte" : filter_date_from, "$lt" : filter_date_to}
  }).populate('word_id').sort({added: -1}).exec( function(err, log){
    if(err) {
      res.render('error', {error:err});
    }
    var util = require('util');
    console.log(util.inspect(log, false, null));
    res.json({
	'result' : {'log' : log}
    });
  });
});



router.get('/log/all', function(req, res) {
  

  TrainLog.find().populate('word_id').sort({added: -1}).exec( function(err, log){
    if(err) {
      res.render('error', {error:err});
    }
    var util = require('util');
    console.log(util.inspect(log, false, null));
    res.json({
	'result' : {'log' : log}
    });
  });
});



module.exports = router;

