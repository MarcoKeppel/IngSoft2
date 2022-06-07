const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require('cors');
const app = express();

const authentication = require('./authentication.js');
const users = require('./users.js');
const tokenChecker = require('./tokenChecker.js');
const upload = require('./upload.js');
const post = require('./post.js');
const gallery = require('./gallery.js');
const home = require('./home.js');
const profile = require('./profile.js');
const follow = require('./follow.js');
const comment = require('./comment.js');
const vote = require('./vote.js');
const coupon = require('./coupon.js');

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 1024 * 1024 // 1 MB
    },
    abortOnLimit: true
 }));

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/', express.static(process.env.FRONTEND || 'static'));
// If process.env.FRONTEND folder does not contain index.html then use the one from static
app.use('/', express.static('static'));
app.use('/img', express.static('app/files'));

app.use((req,res,next) => {
    console.log(req.method + ' ' + req.url)
    next()
})

app.use('/api/v1/authentication', authentication);
app.use('/api/v1/users', users);
app.use('/api/v1/home', tokenChecker, home);
app.use('/api/v1/upload', upload);
app.use('/api/v1/follow', tokenChecker, follow);
app.use('/api/v1/comment', tokenChecker, comment);
app.use('/api/v1/gallery', gallery);
app.use('/profile', profile);
app.use('/post', post);
app.use('/api/v1/vote', tokenChecker, vote);
app.use('/api/v1/coupon', tokenChecker, coupon);


app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;