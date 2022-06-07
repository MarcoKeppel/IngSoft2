const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
    // If is already logged in don't show the login page
    if(req.cookies.token){
        let decoded = await jwt.decode(req.cookies.token);
        if(decoded && decoded.username){
            res.redirect('/');
            return;
        }
    }
    res.sendFile(path.join(__dirname,'../static/login.html'));
});

module.exports = router;

