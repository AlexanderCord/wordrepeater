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








router.post('/words', function(req, res) {
  new Vocabulary({original : req.body.original, translation: req.body.translation})
  .save(function(err, word) {
    console.log(word)
    res.redirect('/vocabulary/words');
  });
});

router.get('/word/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Vocabulary.findOne(query, function(err, word){
    console.log(word)
    res.render(
      'word',
      {title : 'WordRepeater - Vocabulary - ' + word.original, word : word}
    );
  });
});

router.put('/word/:id', function(req, res) {
  var query = {"_id": req.params.id};
  var update = {original : req.body.original , translation: req.body.translation};
  var options = {new: true};
  Vocabulary.findOneAndUpdate(query, update, options, function(err, word){
    console.log(word)
    res.render(
      'word',
      {title : 'WordRepeater - Vocabulary - ' + word.original, word : word}
    );
  });
});

router.delete('/word/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Vocabulary.findOneAndRemove(query, function(err, word){
    console.log(word)
    res.redirect('/vocabulary/words');
  });
});

module.exports = router;

