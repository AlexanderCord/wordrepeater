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

async function saveTrainResult(response, word_id, train_result) {
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


router.get('/start', function(req, res) {
  res.render('train',
    {title: 'Training', word: []}
  );


});

// Default training mode - Words that you've scored with 90% or less
router.get('/default', function(req, response) {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  saveTrainResult(response, req.query.word_id, req.query.train_result);
  
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
  ]).exec().then(res => {
   
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
    console.log("Max" + stat_count);
    rnd = Math.floor(Math.random() * (max - min + 1)) + min;
    new_word_id = train_stats[ rnd ].word_id;
    console.log('Training mode = default');
    return [rnd, new_word_id];
  }).then(([rnd, new_word_id]) => {
    console.log('New word id' + new_word_id);
    console.log('rnd' + rnd);
    Vocabulary.findOne({ "_id": new_word_id }).exec()
    .then(word => {
      console.log('word' + word);
      response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation, 'train_stats': train_stats[rnd]  }});
    });
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
  });

});




// Training mode NEW - New words (zero score)
// @todo update word's score in a cache table to avoid memory overload, or using Mongo's lookup

router.get('/new', async (req, response) => {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  try {
    // Saving training result for this world
    await saveTrainResult(false, req.query.word_id, req.query.train_result);

    console.log('Training mode: new')

    // Loading word_ids for already trained words
    let train_stats = [];
    let stat_count = 0;
    
    let trained_temp = await TrainLog.distinct('word_id').exec()
    let trained = [];
    for(var i = 0; i< trained_temp.length;i++){
      trained[i] = ObjectId(trained_temp[i]);
    }
    console.log("Trained: " + i);
    console.log(trained_temp);
    console.log('Trained first' + trained);
    
    // Loading count of words, excluding word_ids of trained ones
    let count = await Vocabulary.find({"_id": { "$nin" : trained } }).count().exec();
    
    // Get a random entry
    let random = Math.floor(Math.random() * count);
    console.log('random' + random);
    console.log('Trained second' + trained[0]);

    // Loading a radom word    
    word = await Vocabulary.findOne({"_id": { "$nin" : trained } }).skip(random).exec();
    
    // Sending JSON output
    response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation  }});

  } catch(err) {
    // Error handling
    response.render('error', {error:err});
  }

});



/*
router.get('/new', function(req, response) {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  saveTrainResult(response, req.query.word_id, req.query.train_result);

  var train_stats = [];
  console.log('Training mode: new')
  var stat_count = 0;
  TrainLog.distinct('word_id').exec()
  .then(trained_temp => {
    trained = [];
    for(var i = 0; i< trained_temp.length;i++){
      trained[i] = ObjectId(trained_temp[i]);
    }
    console.log("Trained: " + i);
    console.log(trained_temp);
    return trained;

  }).then(trained => {
    console.log('Trained first' + trained);
    random = 0;
    return Vocabulary.find({"_id": { "$nin" : trained } }).count().exec();
    
  }).then( count => {
    // Get a random entry
    random = Math.floor(Math.random() * count);
    
    return [trained, random];
  }).then( ([trained, random]) => {  
    console.log('random' + random);
    console.log('Trained seond' + trained[0]);
    
    return Vocabulary.findOne({"_id": { "$nin" : trained } }).skip(random).exec()
  }).then(word => {
    response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation  }});
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
  });  

});

*/

// Training mode all - All words (random order)
router.get('/all', function(req, response) {
  console.log( req.query.word_id + '=' + req.query.train_result );  
  saveTrainResult(response, req.query.word_id, req.query.train_result);

  console.log('Training mode = all');
  // Get the count of all words
  Vocabulary.count().exec()
  .then( count=> {
    // Get a random entry
    var random = Math.floor(Math.random() * count)

    // Again query all words but only fetch one offset by our random #
    return Vocabulary.findOne().skip(random).exec();
  }).then( word => {
    // Tada! random word
    console.log(word) 
    response.json({'result' : {'word_original': word.original, 'word_id' : word.id, 'word_translation' : word.translation  }});
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
  });
});




/*
******************
Log UI
******************
*/
router.get('/log', function(req, response) {

  TrainLog.find().populate('word_id').sort({added: -1}).exec()
  .then( log =>{
    var util = require('util');
    console.log(util.inspect(log, false, null));
    response.render(
      'log',
      {title : 'Training Log', log : log}
    );
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
  });

});


router.get('/log/filter', function(req, response) {
  filter_date = req.query.date;
  console.log(filter_date);
  var moment = require('moment');
  
  filter_date_from = moment(filter_date, "YYYY-MM-DD").utc();
  filter_date_to = moment(filter_date, "YYYY-MM-DD").add('days', 1).utc();
  console.log(filter_date_from);
  console.log(filter_date_to);

  TrainLog.find({
	added: {"$gte" : filter_date_from, "$lt" : filter_date_to}
  }).populate('word_id').sort({added: -1}).exec()
  .then( log => {
    var util = require('util');
    console.log(util.inspect(log, false, null));
    response.json({
	'result' : {'log' : log}
    });
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
  });

});



router.get('/log/all', function(req, response) {
  

  TrainLog.find().populate('word_id').sort({added: -1}).exec()
  .then( log =>{
    var util = require('util');
    console.log(util.inspect(log, false, null));
    response.json({
	'result' : {'log' : log}
    });
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
  });
  
});

router.get('/stats', function(req, response) {
  console.log( req.query.word_id  );  
  console.log('Train stats for one word');  
  var train_stats = [];
  var stat_count = 0;
  TrainLog.aggregate([
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
  ]).exec().then(res => {
    response.json({'result' : { 'train_stats': res  }});
  }).catch(err => {
    if(err) {
      response.render('error', {error:err});
    }
  });

});


module.exports = router;

