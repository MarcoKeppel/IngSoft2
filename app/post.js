const express = require('express');
const router = express.Router();
const path = require('path');
const Post = require('./models/post.js');
const tokenChecker = require('./tokenChecker');


router.get('/new', tokenChecker, (req, res) => {
    if(!req.loggedUser) {
        res.status(400).json({ error: 'You have to login to create a post!' });
        return;
    }
    res.sendFile(path.join(__dirname,'../static/post.html'));
});

router.get('/:postID', async (req, res) => {
    if(!req.params.postID){
        res.status(400).json({ error: 'You have to specify a post id!' });
        return;
    }
    
    // https://mongoosejs.com/docs/api.html#model_Model.find
    let post = await Post.findOne({_id: req.params.postID});
    if(!post){
        res.status(400).json({ error: 'Post not found!' });
        return;
    }
    res.sendFile(path.join(__dirname,'../static/post.html'));
});

module.exports = router;

