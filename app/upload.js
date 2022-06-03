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
  let post = await Post.findOne({_id: req.params.postID})
    .select("title text votes user comments picture_name picture_path time -_id")
    //.select("comments -_id")
    .populate([
      {
        path: "comments",
        model: Comment,
        select: "text votes user answer time -_id",
        populate: {
          path: "user",
          model: User,
          select: "username -_id",
        }
      },
      {
        path: "user",
        select: "username -_id",
        model: User
      }
    ])
    .lean()

  if(!post){
      res.status(400).json({ error: 'Post not found!' });
      return;
  }

  // This sould not be necessary, but let's check it anyway
  if(!post.user.hasOwnProperty("username")){
      res.status(400).json({ error: 'User not found!' });
      return; 
  }

  res.status(200).json(post);
});

module.exports = router;