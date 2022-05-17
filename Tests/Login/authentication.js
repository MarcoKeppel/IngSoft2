const express = require('express');
const cookieParser = require('cookie-parser');
const router = express.Router();
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const key = "05020516024124375";

router.post('', async function(req, res){

    let username = "Pippo";
    let password = "Prova";
    
    if(password != req.body.password)
        res.json({success: false, message: 'Authentication failed. Wrong password.'})
    
    var payload = {
        "username": username
    };

    var options = {expiresIn: 84600};
    var token = jwt.sign(payload, key, options);

    console.log("Token: " + token);

    res.cookie("Username", username);
    res.cookie("Token", token);

    res.json({
        success: true,
        message: "Enjoy your token",
        token: token,
        username: username,
        self: "authentication.js"
    });

    res.redirect(301, "/");
});

module.exports = router;