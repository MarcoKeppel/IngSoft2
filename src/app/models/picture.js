var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Picture', new Schema({ 
	name: String,
	path: String
}));