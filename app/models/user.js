var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({ 
	email: String,
	password: String,
	username: String,
	posts: 
	[
		{
			type: Schema.Types.ObjectId,
			ref: 'Post'
		}
	],
	followers: [
		{
			type: String
		}
	],
	follows: [
		{
			type: String
		}
	],
	notifications: [
		{
			seen: Boolean,
			post: {
				type: Schema.Types.ObjectId,
				ref: 'Post'
			}
		}
	]
}));