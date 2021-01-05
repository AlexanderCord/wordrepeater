import mongoose from 'mongoose';

interface ITrainLog {
  word_id: mongoose.Schema.Types.ObjectId,
  train_result: Boolean,
  added: Date
}

export default ITrainLog;