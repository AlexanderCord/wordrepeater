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

mongoose.set('useFindAndModify', false);
var config = require('../config');

let mongoConnect = "mongodb://"+config.mongo.user+":"+encodeURIComponent(config.mongo.password)+"@"+config.mongo.host+":"+config.mongo.port+"/"+config.mongo.db+"?authSource=admin";
//console.log(mongoConnect);
mongoose.connect(mongoConnect, { useFindAndModify: false,  useNewUrlParser: true });

