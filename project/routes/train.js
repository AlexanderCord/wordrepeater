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


router.get('/next', function(req, res) {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  var ObjectId = require('mongodb').ObjectID;
  new TrainLog({
      word_id : ObjectId(req.query.word_id),
      train_result: req.query.train_result == "yes" ? true : false
      })
    .save(function(err, word) {
      if(err) {
        res.render('error', {error:err});
      }
      console.log('train log added')
    });

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
        res.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation  }});
      })
  })
  

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

