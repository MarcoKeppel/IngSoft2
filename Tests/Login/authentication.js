const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const key = "05020516024124375";

router.post('', async function(req, res){

    let username = "Pippo";
    let password = "Prova";
    
    if(password != req.body.password || username != req.body.username)
        res.json({success: false, message: 'Authentication failed. Wrong password.'})
    else
    {
        var payload = {
            "username": username
        };

        var options = {expiresIn: 84600};
        var token = jwt.sign(payload, key, options);

        res.cookie("username", username);
        res.cookie("token", token);

        res.redirect("back");
    }
});

module.exports = router;