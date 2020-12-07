var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');

router.get('/words', function(req, response) {

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
  ]).exec().then(function(res) {
  
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
  }).then( res => {
    Vocabulary.find().sort({original: 1}).exec()
    .then( words => {
      //console.log(words)
      response.render(
        'words',
        {title : 'Vocabulary', words : words, train_stats: train_stats}
      );
    }) 
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
    
  });

});

router.post('/words', function(req, res) {
  new Vocabulary({original : req.body.original, translation: req.body.translation})
  .save().then(word => {
    console.log(word)
    res.redirect('/vocabulary/words?added');
  })
  .catch(err => {
    if(err) {
      res.render('error', {error:err});
    }
    
  });
  
});

router.get('/word/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Vocabulary.findOne(query).exec()
  .then(word => {
    console.log(word)
    res.render(
      'word',
      {title : 'Vocabulary - ' + word.original, word : word}
    );
  }).catch(err => {
    if(err) {
      res.render('error', {error:err});
    }
    
  });
  
});

router.put('/word/:id', function(req, res) {
  var query = {"_id": req.params.id};
  var update = {original : req.body.original , translation: req.body.translation};
  var options = {new: true};
  Vocabulary.findOneAndUpdate(query, update, options)
  .then(word => {
    console.log(word)
    res.render(
      'word',
      {title : 'Vocabulary - ' + word.original, word : word}
    );
  }).catch(err => {
    if(err) {
      res.render('error', {error:err});
    }
    
  });
  
});

router.delete('/word/:id', function(req, res) {
  var query = {"_id": req.params.id}


  Vocabulary.findOneAndRemove(query)
  .then( word => {
    console.log('removing word');
    console.log(word);
  }).then( () => { 
    TrainLog.deleteMany({word_id: req.params.id })
    .exec().then( () => {
      console.log('removed log');
      res.redirect('/vocabulary/words');
    })
  }).catch(err => {
    if(err) {
      res.render('error', {error:err});
    }
    
  });  
});

module.exports = router;

