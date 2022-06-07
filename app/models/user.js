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
			obj: Schema.Types.ObjectId,
			class: String,
		}
	],
	couponPoints: Number
}));