const express = require('express');
const router = express.Router();
const Post = require('./models/post.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const Comment = require('./models/comment.js');
const path_module = require('path');

router.post("/", async (req, res) => {
    if (!req.body.comment) {
        return res.status(400).send("A comment cannot be blank.");
    }
    if (!req.body.answer) {
        return res.status(400).send("A comment must be either an answer or not.");
    }
    if(!req.body.post){
        return res.status(400).send("A comment must be on a post");
    }

    let user = await User.findOne({_id: req.loggedUser.id});

    if(user)
    {
        let comment = new Comment({
            text: req.body.comment,
            votes: {
                likes: 0,
                dislikes: 0
            },
            user: req.loggedUser.id,
            post: req.body.post,
            answer: req.body.answer,
            time: Date.now()
        });

        await comment.save();
    }
    else
    {
      return res.status(400).send("No user found");
    }
    
    return res.status(500).send("Comment was uploaded");
});

module.exports = router;