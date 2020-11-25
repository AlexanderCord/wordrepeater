var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Vocabulary = new Schema(
  {original : String, translation: String}
);
 
 
mongoose.model('Vocabulary', Vocabulary);

mongoose.connect('mongodb://localhost/node-wordrepeater');

