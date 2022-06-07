const express = require('express');
const router = express.Router();
const ImageFile = require('./models/imageFile.js');
const tokenChecker = require('./tokenChecker.js');

router.get("/:filename", async (req, res) => {

	// Get image from DB
    let image = await ImageFile.findOne({filename: req.params.filename});

    // If image does not exist, 404
    if (!image) {
        res.status(404).send();
        return;
    }

    res.contentType(image.image.contentType).send(image.image.data);
});

router.get("/:username", async (req, res) => {
    if(!req.params.username){
        res.status(400).json({ error: 'You have to specify a username!' });
        return;
    }

	// Get all users from DB
    let user = await User.findOne({username: req.params.username}).select('email posts -_id').populate('posts', 'title').lean();

    if(!user){
        res.status(400).json({ error: 'User not found!' });
        return;
    }
    let posts = user.posts;
    posts.sort( (a, b) => {
        return b.time - a.time;
    });

    res.json(posts);
});

module.exports = router;
