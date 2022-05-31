var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
const postSchema = new Schema({
    title: String,
    votes: {
        likes: Number,
        dislikes: Number,
    },
	user:
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
	comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    picture_name: String,
	picture_path: String,
	time: Number	// Time of upload
});

// Calling status gives the number of likes displayed
postSchema.virtual('status').get(function(){
    return this.votes.likes - this.votes.dislikes;
});

const post = mongoose.model('Post', postSchema);

module.exports = post;