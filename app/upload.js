const express = require('express');
const router = express.Router();

const Post = require('./models/post.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const Comment = require('./models/comment.js'); // get our mongoose model
const ImageFile = require('./models/imageFile.js');

const path_module = require('path');
const fs = require('fs');
const tokenChecker = require('./tokenChecker.js');
const notify = require('./notification.js');

router.post("/", tokenChecker, async (req, res) => {
    if (!req.files) {
      res.status(400).json({success:false, error: "No files were uploaded."});
      return;
    }
    if(!req.body.title){
      res.status(400).json({success:false, error: "A title for the post must be provided"});
      return;
    }
  
    const file = req.files.myFile;
    path = __dirname + "/files/";
    
    const allowed_files_extensions = ['.png', '.jpeg', '.jpg', '.gif'];
    const allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    let extension = path_module.extname(file.name);
    console.log(extension);
    if(!allowed_files_extensions.includes(extension) || !allowed_file_types.includes(file.mimetype)){
      console.log(allowed_files_extensions.includes(extension), allowed_file_types.includes(file.mimetype));  
      res.status(415).json({success:false, error: "Invalid file type provided"});
    }

    let user = await User.findOne({_id: req.loggedUser.id});
    
    if (!user){
      res.status(400).json({success:false, error: "No user found"});
      return;
    }

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
    notify("post", post._id.toString(), req.loggedUser.id);

    path += post.picture_path;

    file.mv(path, (err) => {

      if (err) {
        res.status(500).json({success:false, error: err});
      }

      let imageFile = new ImageFile({
        filename: post.picture_path,
        image: {
          data: fs.readFileSync(path),
          contentType: file.mimetype
        }
      });
      imageFile.save();

      res.status(200).json({success:true, location: '/post/' + post._id});

    });
    
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
      res.status(400).json({ success: false, error: 'Post not found!' });
      return;
  }

  // This sould not be necessary, but let's check it anyway
  if(!post.user.hasOwnProperty("username")){
      res.status(400).json({ success: false, error: 'User not found!' });
      return; 
  }

  res.status(200).json({success: true, post});
});

module.exports = router;