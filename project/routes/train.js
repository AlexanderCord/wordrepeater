var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');


router.get('/start', function(req, res) {
  // Get the count of all users
  Vocabulary.count().exec(function (err, count) {

    // Get a random entry
    var random = Math.floor(Math.random() * count)

    // Again query all users but only fetch one offset by our random #
    Vocabulary.findOne().skip(random).exec(
      function (err, word) {
        // Tada! random user
        console.log(word) 
        res.render(
          'train',
          {title: 'WordRepeater - Training', word: word}
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
      console.log('train log added')
    });

  // Get the count of all users
  Vocabulary.count().exec(function (err, count) {

    // Get a random entry
    var random = Math.floor(Math.random() * count)

    // Again query all users but only fetch one offset by our random #
    Vocabulary.findOne().skip(random).exec(
      function (err, word) {
        // Tada! random user
        console.log(word) 
        res.json({'result' : {'word_original': word.original, 'word_id' : word.id  }});
      })
  })
  

});


router.get('/log', function(req, res) {

  TrainLog.find().populate('word_id').sort({added: -1}).exec( function(err, log){
    var util = require('util');
    console.log(util.inspect(log, false, null));
    res.render(
      'log',
      {title : 'WordRepeater - Training Log', log : log}
    );
  });
});




module.exports = router;

