var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');
var ObjectId = require('mongodb').ObjectID;
const {
  startTraining,
  defaultTraining,
  newWordsTraining,
  allWordsTraining,
  logPage,
  logFilter,
  allLog,
  wordStats
} = require('../controllers/train');

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


router.get('/start', startTraining);

// Default training mode - Words that you've scored with 90% or less
router.get('/default', defaultTraining);



// Training mode NEW - New words (zero score)
// @todo update word's score in a cache table to avoid memory overload, or using Mongo's lookup
// @todo JSON errors render in JSON format => client-side update
router.get('/new', newWordsTraining);


// Training mode all - All words (random order)
router.get('/all', allWordsTraining);


/*
******************
Log UI
******************
*/
router.get('/log', logPage);


router.get('/log/filter', logFilter);

router.get('/log/all', allLog);

router.get('/stats', wordStats);


module.exports = router;

