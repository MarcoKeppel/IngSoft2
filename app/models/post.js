var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
const postSchema = new Schema({
    title: String,
    votes: {        // Contains the id of users that voted on the post
        likes: [String],
        dislikes: [String]
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

// TODO: Modify it so it works
// Calling status gives the number of likes displayed
postSchema.virtual('status').get(function(){
    return this.votes.likes.length - this.votes.dislikes.length;
});

const post = mongoose.model('Post', postSchema);

module.exports = post;