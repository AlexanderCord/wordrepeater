var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Vocabulary = mongoose.model('Vocabulary');
var TrainLog = mongoose.model('TrainLog');
const {words, word, addWord, updateWord, deleteWord} = require('../controllers/words');


router.get('/words', words);

router.post('/words', addWord);

router.get('/word/:id', word);

router.put('/word/:id', updateWord);

router.delete('/word/:id', deleteWord);

module.exports = router;

