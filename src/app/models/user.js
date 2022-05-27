var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({ 
	email: String,
	password: String,
	username: String,
	pictures: [
		{
			type: mongoose.Schema.Types.ObjectId,
        	ref: "Picture"
		}
	]
}));