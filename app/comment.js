const express = require('express');
const router = express.Router();
const Post = require('./models/post.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const Comment = require('./models/comment.js');
const notify = require('./notification.js');

router.post("/", async (req, res) => {
    if (!req.body.comment) {
        res.status(400).json({success:false, error: "A comment cannot be blank."});
        return;
    }
    
    if(!req.body.postId){
        res.status(400).json({success:false, error: "A comment must be on a post"});
        return;
    }

    let post = await Post.findOne({_id: req.body.postId});
    if(!post){
        res.status(400).json({success:false, error: "Post not found"});
        return;
    }

    let answer = false;
    if(req.body.answer){
        answer = true
    }
    let user = await User.findOne({_id: req.loggedUser.id});

    if(!user){
        res.status(400).json({success:false, error: 'User not found!'});
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
    res.status(200).json({location: '/post/' + post._id, success: true});
});

router.get('/:commentID', async (req, res) => {  
    if(!req.params.commentID){
        res.status(400).json({success:false, error: 'You have to specify a comment ID!' });
        return;
    }
    
    // https://mongoosejs.com/docs/api.html#model_Model.find
    let comment = await Comment.findOne({_id: req.params.commentID})
      .select("text votes user user post -_id")
      .populate([
        {
          path: "post",
          model: Post,
          select: "_id",
        },
        {
          path: "user",
          select: "username -_id",
          model: User
        }
      ])
      .lean()
  
    if(!comment){
        res.status(400).json({success:false, error: 'Comment not found!' });
        return;
    }
  
    // This sould not be necessary, but let's check it anyway
    if(!comment.user.hasOwnProperty("username")){
        res.status(400).json({success:false, error: 'User not found!' });
        return; 
    }
  
    res.status(200).json({success:true, comment});
  });

module.exports = router;