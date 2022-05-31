const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('./models/user.js');


router.get('/:username', async (req, res) => {
    if(!req.params.username){
        res.status(400).json({ success: false, message: 'You have to specify a username!' });
        return;
    }
    
    if(req.params.username == req.loggedUser.username || req.params.username == "me" ){
        res.status(400).json({ success: false, message: 'You cannot follow yourself!' });
        return;
    }
    
    let other = await User.findOne({username: req.params.username});
    let me = await User.findOne({username: req.loggedUser.username});
    if(!other){
        res.status(400).json({ success: false, message: 'User to follow not found!' });
        return;
    }
    let text = "Follow";
    if(me.follows.includes(other.username) || other.followers.includes(me.username)){
        // If it is already following this user, unfollow them.
        me.follows = me.follows.filter(e => e !== other.username);
        other.followers = other.followers.filter(e => e !== me.username);
    }else{
        me.follows.push(other.username);
        other.followers.push(me.username);
        text = "Unfollow";
    }
    
    await me.save();
    await other.save();
    return res.status(200).json({
        success: true,
        message: text,
    });
});

module.exports = router;

