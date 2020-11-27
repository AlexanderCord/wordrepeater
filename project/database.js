var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var ObjectId = require('mongodb').ObjectID;

var Vocabulary = new Schema(
  {original : String, translation: String}
);
 
var TrainLog = new Schema(
  {word_id: {type: Schema.Types.ObjectId, ref: 'Vocabulary'}, train_result: Boolean, added: {type: Date, default: Date.now } }
);
 
mongoose.model('Vocabulary', Vocabulary);
mongoose.model('TrainLog', TrainLog);

mongoose.connect('mongodb://localhost/node-wordrepeater');

