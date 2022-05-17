const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const tokenChecker = require('./tokenChecker.js');

const authentication = require('./authentication.js');
const req = require('express/lib/request');
const res = require('express/lib/response');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

console.log("Cookies: " + req.cookies);

app.use(cors());

app.use('/', express.static(process.env.FRONTEND || 'static'));
// If process.env.FRONTEND folder does not contain index.html then use the one from static
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