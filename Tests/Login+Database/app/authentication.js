const express = require('express');
const router = express.Router();
const Users = require("./models/users.js");
const jwt = require('jsonwebtoken');

const key = "127E6RR5e725D583a2476";

router.post("", async function(req, res){
    new Users({ username: 'PPP', password: 'UUUU' }).save().then(() => console.log('Done'));
    let user = await Users.findOne({
        username: req.body.username
    }).exec();

    if(!user)
    {
        res.json({success: false, message: "Authentication failed. No such user"});
    }
    else if(user.password != req.body.password)
    {
        res.json({success: false, message: "Authentication failed. Wrong password"});
    }
    else
    {
        var payload = {
            username: user.username,
            id: user._id
        };
    
        var options = {
            expiresIn: 300
        }
    
        var token = jwt.sign(payload, key, options);
    
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token,
            email: user.email,
            id: user._id,
            self: "api/v1/" + user._id
        });
    }
});

module.exports = router;