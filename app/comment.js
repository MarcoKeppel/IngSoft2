const express = require('express');
const router = express.Router();
const Post = require('./models/post.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const Comment = require('./models/comment.js');
const notify = require('./notification.js');

router.post("/", async (req, res) => {
    if (!req.body.comment) {
        return res.status(400).send("A comment cannot be blank.");
    }
    
    if(!req.body.postId){
        return res.status(400).send("A comment must be on a post");
    }

    let post = await Post.findOne({_id: req.body.postId});
    if(!post){
        return res.status(400).send("Post not found");
    }

    let answer = false;
    if(req.body.answer){
        answer = true
    }
    let user = await User.findOne({_id: req.loggedUser.id});

    if(!user){
        res.status(400).json({ error: 'User not found!' });
        return; 
    }

    
    let comment = new Comment({
        text: req.body.comment,
        votes: {
            likes: [],
            dislikes: []
        },
        user: req.loggedUser.id,
        post: post._id,
        answer: answer,
        time: Date.now()
    });

    await comment.save();    
    post.comments.push(comment);
    await post.save();
    notify("comment", comment._id.toString(), comment.user.toString());

    
    return res.redirect('/post/' + post._id);
});

module.exports = router;