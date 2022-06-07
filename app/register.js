const express = require('express');
const router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
    // If is already logged in don't show the registration page
    if(req.cookies.token){
        let decoded = await jwt.decode(req.cookies.token);
        if(decoded && decoded.username){
            res.redirect('/');
            return;
        }
    }
    res.sendFile(path.join(__dirname,'../static/register.html'));
});

module.exports = router;

