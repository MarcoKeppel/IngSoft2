const express = require('express');
const app = express();

const authentication = require("./authentication.js");
const users = require('./users.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', express.static(process.env.FRONTEND || 'static'));
// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static'));

app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})

app.use('/api/v1/authentication', authentication);
app.use('/api/v1/users', users);

app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;