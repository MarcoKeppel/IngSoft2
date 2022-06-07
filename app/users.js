const express = require('express');
const router = express.Router();
const User = require('./models/user.js'); // get our mongoose model
const tokenChecker = require('./tokenChecker.js');
const jwt = require('jsonwebtoken');

// Questa rotta deve essere autenticata
router.get('/me', tokenChecker, async (req, res) => {
    if(!req.loggedUser) {
        res.status(400).json({ success: false, error: 'You have to login!' });
        return;
    }
    
    // https://mongoosejs.com/docs/api.html#model_Model.find
    let user = await User.findOne({_id: req.loggedUser.id});

    res.status(200).json({
        success: true,
        self: req.loggedUser.username,
        email: user.email,
        pictures : user.pictures,
        username: user.username,
        followers: user.followers,
        follows: user.follows,
    });
});

router.get('/:username', async (req, res) => {  
    if(!req.params.username){
        res.status(400).json({ success: false, error: 'You have to specify a username!' });
        return;
    }
    
    // https://mongoosejs.com/docs/api.html#model_Model.find
    let user = await User.findOne({username: req.params.username});
    if(!user){
        res.status(400).json({ error: 'User not found!' });
        return;
    }
    let self = "";
    if(req.cookies.token){
        let decoded = await jwt.decode(req.cookies.token);
        if(decoded && decoded.username){
            self = decoded.username;
        }
    }

    res.status(200).json({
        success: true,
        self: self,
        email: user.email,
        pictures : user.pictures,
        username: user.username,
        followers: user.followers,
        follows: user.follows,
    });
});


router.get('', async (req, res) => {
    let users;
    
    if (req.query.email)
        // https://mongoosejs.com/docs/api.html#model_Model.find
        users = await User.find({email: req.query.email}).exec();
    else
        users = await User.find().exec();

        users = users.map( (entry) => {
            return {
                self: '/api/v1/users/' + entry.id,
                email: entry.email
            }
        });

    res.status(200).json(users);
});

router.post('', async (req, res) => {
    
	let user = new User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        pictures: [],
        followers: [],
        follows: []
    });
    
    if(!user.username || typeof user.email != 'string'){
        res.status(400).json({ error: 'Username is required!' });
        return;
    }
    if(['me', 'example', 'test'].includes(user.username)){
        res.status(400).json({ error: "Username cannot be one of ['me', 'example', 'test']!" });
        return;
    }
    if(!user.password || typeof user.email != 'string'){
        res.status(400).json({ error: 'Password is required!' });
        return;
    }

    if (!user.email || typeof user.email != 'string' || !checkIfEmailInString(user.email)) {
        res.status(400).json({ error: 'The field "email" must be a non-empty string, in email format' });
        return;
    }
    let emailExists = await emailAlreadyExists(user.email);
    let userExists = await userAlreadyExists(user.username);
    
    if (emailExists) {
        res.status(400).json({ error: 'A user with the email ' + user.email + ' already exists.' });
        return;
    }

    if (userExists) {
        res.status(400).json({ error: 'A user with the username ' + user.username  + ' already exists.' });
        return;
    }

    
	user = await user.save();
    
    let userId = user.id;
    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/users/" + userId).status(201).send();
});



// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function checkIfEmailInString(text) {
    // eslint-disable-next-line
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);
}


async function emailAlreadyExists(e) {
    let emailExists = await User.exists({ email: e });
    return emailExists;
}

async function userAlreadyExists(u) {
    let userExists = await User.exists({ username: u });
    return userExists;
}



module.exports = router;
