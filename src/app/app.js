const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require("express-fileupload");
const path = require("path");
const app = express();

const authentication = require('./authentication.js');
const users = require('./users.js');
const tokenChecker = require('./tokenChecker.js');
const upload = require('./upload.js');
const gallery = require('./gallery.js');
const home = require('./home.js');

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
app.use('/api/v1/upload', tokenChecker, upload);
app.use('/api/v1/gallery', tokenChecker, gallery);
// Stavo provando a fare in modo che se esiste un token il sito ti manda direttamente alla home senza passare per il login ma non riesco a capire come usare il token :(
// app.use('/', tokenChecker, function(req, res){
//     if(req.loggedUser)
//         res.redirect('/api/v1/home');
// });

app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;