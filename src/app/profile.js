const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('./models/user.js');
const tokenChecker = require('./tokenChecker');


router.get('/me', tokenChecker, (req, res) => {
    if(!req.loggedUser) {
        res.status(400).json({ error: 'You have to login!' });
        return;
    }
    res.sendFile(path.join(__dirname,'../static/profile.html'));
});

router.get('/:username', async (req, res) => {
    if(!req.params.username){
        res.status(400).json({ error: 'You have to specify a username!' });
        return;
    }
    
    // https://mongoosejs.com/docs/api.html#model_Model.find
    let user = await User.findOne({username: req.params.username});
    if(!user){
        res.status(400).json({ error: 'User not found!' });
        return;
    }
    res.sendFile(path.join(__dirname,'../static/profile.html'));
});

module.exports = router;

