var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const commentSchema = new Schema({ 
	text: String,
    votes: {        // Contains the id of users that voted on the comment
        likes: [String],
        dislikes: [String]
    },
    user:  
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post: 
    {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    answer: Boolean,
    time: Number	// Time of upload
});

// TODO: Modify it so it works
// Calling status gives the number of likes displayed
commentSchema.virtual('status').get(function(){
    return this.votes.likes.length - this.votes.dislikes.length;
});

const comment = mongoose.model('Comment', commentSchema);

module.exports = comment;