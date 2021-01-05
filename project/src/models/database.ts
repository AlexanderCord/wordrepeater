import mongoose from 'mongoose';
import IVocabulary from './ivocabulary';
import ITrainLog from './itrainlog';

var Schema   = mongoose.Schema;

var ObjectId = require('mongodb').ObjectID;


const VocabularySchema = new Schema(
  {
    original : String,
    translation: String
  }
);
 
const TrainLogSchema = new Schema(
  {
    word_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary'},
    train_result: Boolean,
    added: {type: Date, default: Date.now }
  }
);
 
const Vocabulary = mongoose.model<IVocabulary & mongoose.Document>('Vocabulary', VocabularySchema);
const TrainLog = mongoose.model<ITrainLog & mongoose.Document>('TrainLog', TrainLogSchema);

mongoose.set('useFindAndModify', false);
var config = require('../config');

let mongoConnect = "mongodb://"+config.mongo.user+":"+encodeURIComponent(config.mongo.password)+"@"+config.mongo.host+":"+config.mongo.port+"/"+config.mongo.db+"?authSource=admin";
//console.log(mongoConnect);
mongoose.connect(mongoConnect, { useFindAndModify: false,  useNewUrlParser: true });

export  { Vocabulary, TrainLog }

