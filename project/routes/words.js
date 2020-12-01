var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');

router.get('/words', function(req, res) {

  var train_stats = [];
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
      }
    },
    {
      $sort: {"train_result_yes": -1 }
    },
  ]).exec( function(err, res) {
    if(err){
      res.render('error', {error:err});
    }
  
    if(res.length > 0) {
      for(i=0; i<res.length; i++) {
        train_stats[ res[i]._id.word_id ] = res[i];
        
        train_stats[ res[i]._id.word_id ].success_rate = 0;
        if(res[i].train_result_yes + res[i].train_result_no > 0){
          train_stats[ res[i]._id.word_id ].success_rate = Math.round(100*res[i].train_result_yes/(res[i].train_result_yes + res[i].train_result_no));
        }
        
      }
    }
  
    console.log(train_stats);
  });


  Vocabulary.find().sort({original: 1}).exec(function(err, words){
    if(err) {
      res.render('error', {error:err});
    }
    //console.log(words)
    res.render(
      'words',
      {title : 'Vocabulary', words : words, train_stats: train_stats}
    );
  });
  //res.send('Just a test');
  //res.render('api', { title: 'Vocabulary API ' + Math.random()*10 });

});

router.post('/words', function(req, res) {
  new Vocabulary({original : req.body.original, translation: req.body.translation})
  .save(function(err, word) {
    if(err) {
      res.render('error', {error:err});
    }
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
      {title : 'Vocabulary - ' + word.original, word : word}
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
      {title : 'Vocabulary - ' + word.original, word : word}
    );
  });
});

router.delete('/word/:id', function(req, res) {
  var query = {"_id": req.params.id}


  Vocabulary.findOneAndRemove(query, function(err, word){
    if(err) {
      res.render('error', {error:err});
    }
    console.log('removing word');
    console.log(word);
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

