const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const tokenChecker = require('./tokenChecker.js');

const jwt = require('jsonwebtoken');

const tokenChecker = function(req, res, next) {
    // header or url parameters or post parameters
    const key = "05020516024124375";
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (!token) res.status(401).json({success:false,message:'No token provided.'})
    // decode token, verifies secret and checks expiration
    jwt.verify(token, key, function(err, decoded) {
    if (err) res.status(403).json({success:false,message:'Token not valid'})
        else {
            // if everything is good, save in req object for use in other routes
            req.loggedUser = decoded;
            console.log(loggedUser);
            next();
        }
    });
};

const authentication = require('./authentication.js');
const req = require('express/lib/request');
const res = require('express/lib/response');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors());

// app.use('/', express.static('static')); // expose also this folder

app.use('/', tokenChecker, function(req, res) {
    app.use('/', express.static('static', {index: "indexLogged.html"}))
});
app.use('/', express.static('static')); // expose also this folder

app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})

app.use('/api/v1/authentication', authentication);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;