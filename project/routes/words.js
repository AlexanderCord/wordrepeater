var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');

router.get('/words', function(req, res) {

  Vocabulary.find(function(err, words){
    console.log(words)
    res.render(
      'words',
      {title : 'WordRepeater - Vocabulary', words : words}
    );
  });
  //res.send('Just a test');
  //res.render('api', { title: 'Vocabulary API ' + Math.random()*10 });

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
    if(err) {
	res.render('error', {error:err});
	return;
    } 
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
    if(err) {
	res.render('error', {error:err});
	return;
    } 

    console.log(word)
    res.render(
      'word',
      {title : 'WordRepeater - Vocabulary - ' + word.original, word : word}
    );
  });
});

router.delete('/word/:id', function(req, res) {
  var query = {"_id": req.params.id}


  Vocabulary.findOneAndRemove(query, function(err, word){
    console.log('removing word');
    console.log(word);
    if(err) {
	res.render('error', {error:err});
    } 
    TrainLog.deleteMany({word_id: req.params.id }, function(err) {
	if(err) {
          res.render('error', {error:err});	  
	}
	console.log('removing log');
	res.redirect('/vocabulary/words');
    });
    

  });
});

module.exports = router;

