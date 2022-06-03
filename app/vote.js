const express = require('express');
const router = express.Router();
const Post = require('./models/post.js');
const Comment = require('./models/comment.js');

router.post("/:ID", async (req, res) => {

    if(!req.params.ID){
        res.status(400).json({ error: 'You have to specify an ID!' });
        return;
    }
    if(req.body.vote == undefined){
        res.status(400).json({ error: 'You have to specify a vote!' });
        return;
    }

    if(req.body.type === "post")
    {
        let post = await Post.findOne({_id: req.params.ID});
        if(!post){
            res.status(400).json({ error: 'Post not found!' });
            return;
        }

        let liked = false;
        let disliked = false;
        let added = 0;

        if(post.votes.likes.includes(req.loggedUser.id))
        {
            post.votes.likes = post.votes.likes.filter(e => e !== req.loggedUser.id);
            await post.save();
            liked = true;
            added -= 1;
        }
        if(post.votes.dislikes.includes(req.loggedUser.id))
        {
            post.votes.dislikes = post.votes.dislikes.filter(e => e !== req.loggedUser.id);
            await post.save();
            disliked = true;
            added += 1;
        }

        if(req.body.vote > 0 && !liked)
        {
            post.votes.likes.push(req.loggedUser.id);
            await post.save();
            added += 1;
            let status = post.status;
            res.status(200).json({success: true, change: added, total: status});
            return;
        }
        else if(req.body.vote < 0 && !disliked)
        {
            post.votes.dislikes.push(req.loggedUser.id);
            await post.save();
            added -= 1;
            let status = post.status;
            res.status(200).json({success: true, change: added, total: status});
            return;
        }
        else
        {
            let status = post.status;
            res.status(200).json({success: true, change: added, total: status});
            return;
        }
    }
    else if(req.body.type === "comment")
    {
        let comment = await Comment.findOne({_id: req.params.ID});
        if(!comment){
            res.status(400).json({ error: 'Comment not found!' });
            return;
        }

        let liked = false;
        let disliked = false;
        let added = 0;

        if(comment.votes.likes.includes(req.loggedUser.id))
        {
            comment.votes.likes = comment.votes.likes.filter(e => e !== req.loggedUser.id);
            await comment.save();
            liked = true;
            added -= 1;
            console.log("Tolgo like a: " + comment);
        }
        if(comment.votes.dislikes.includes(req.loggedUser.id))
        {
            comment.votes.dislikes = comment.votes.dislikes.filter(e => e !== req.loggedUser.id);
            await comment.save();
            disliked = true;
            added += 1
            console.log("Tolgo dislike a: " + comment);
        }

        if(req.body.vote > 0 && !liked)
        {
            comment.votes.likes.push(req.loggedUser.id);
            await comment.save();
            added += 1;
            let status = comment.status;
            console.log("Metto like a: " + comment);
            res.status(200).json({success: true, change: added, total: status});
            return;
        }
        else if(req.body.vote < 0 && !disliked)
        {
            comment.votes.dislikes.push(req.loggedUser.id);
            await comment.save();
            added -= 1;
            let status = comment.status;
            console.log("Metto dislike a: " + comment);
            res.status(200).json({success: true, change: added, total: status});
            return;
        }
        else
        {
            let status = comment.status;
            res.status(200).json({success: true, change: added, total: status});
            return;
        }
    }

});

module.exports = router;