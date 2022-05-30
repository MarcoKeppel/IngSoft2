var mongoose = require('mongoose');
var Schema = mongoose.Schema;


const commentSchema = new Schema({ 
	text: String,
    votes: {
        likes: Number,
        dislikes: Number,
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

// Calling status gives the number of likes displayed
commentSchema.virtual('status').get(function(){
    return this.votes.likes - this.votes.dislikes;
});

const comment = mongoose.model('Comment', commentSchema);

module.exports = comment;