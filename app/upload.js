const express = require('express');
const router = express.Router();
const Post = require('./models/post.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const Comment = require('./models/comment.js'); // get our mongoose model
const path_module = require('path');
const tokenChecker = require('./tokenChecker.js');

router.post("/", tokenChecker, async (req, res) => {
    if (!req.files) {
      return res.status(400).send("No files were uploaded.");
    }
    if(!req.body.title){
      console.log("No title provided");
      return res.status(400).send("A title for the post must be provided");
    }
  
    const file = req.files.myFile;
    path = __dirname + "/files/";
    
    const allowed_files_extensions = ['.png', '.jpeg', '.jpg', '.gif'];
    const allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    let extension = path_module.extname(file.name);
    console.log(extension);
    if(!allowed_files_extensions.includes(extension) || !allowed_file_types.includes(file.mimetype)){
      console.log(allowed_files_extensions.includes(extension), allowed_file_types.includes(file.mimetype));  
      return res.status(415).send("Invalid file type provided");
    }
    
    console.log(file.name);
    
    let user = await User.findOne({_id: req.loggedUser.id});
    
    if (user)
    {
      let post = new Post({
        title: req.body.title,
        votes: {
          likes: [],
          dislikes: []
        },
        user: '',
        comments: [],
        picture_name: file.name,
        picture_path: '',
        time: Date.now()
      });

      post.user = user;
      await post.save();
      user.posts.push(post);
      await user.save();

      post.picture_path = post._id + '.' + file.name.split('.').pop();    // Object ID in DB + extension of original file
      await post.save();

      path += post.picture_path;

      file.mv(path, (err) => {
        if (err) {
          return res.status(500).send(err);
        }
        return res.redirect('/post/' + post._id);
      });
    }
    else
    {
      return res.status(400).send("No user found");
    }
});

router.get('/:postID', async (req, res) => {  
  if(!req.params.postID){
      res.status(400).json({ error: 'You have to specify a post ID!' });
      return;
  }
  
  // https://mongoosejs.com/docs/api.html#model_Model.find
  let post = await Post.findOne({_id: req.params.postID});
  if(!post){
      res.status(400).json({ error: 'Post not found!' });
      return;
  }

  // This sould not be necessary, but let's check it anyway
  let user = await User.findOne({_id: post.user});
  if(!user){
      res.status(400).json({ error: 'User not found!' });
      return; 
  }

  let comments = [];
  for(let i = 0; i < post.comments.length; i++){
    let comment = await Comment.findOne({_id: post.comments[i]});
    if(comment){
      let userComment = await User.findOne({_id: comment.user._id});
      let tmp_comment = {};
      tmp_comment.text = comment.text;
      tmp_comment.votes = comment.votes;
      tmp_comment.user = {
        username : userComment.username,
      };
      tmp_comment.time = comment.time;
      comments.push(tmp_comment);
    }
  }
  console.log(comments);

  res.status(200).json({
    title: post.title,
    text: post.text,
    votes: post.votes,
    user: {
      username: user.username,      
    },
    comments: comments,
    picture_name: post.picture_name,
    picture_path: post.picture_path,
    time: post.time
  });
});

module.exports = router;