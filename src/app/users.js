const express = require('express');
const router = express.Router();
const User = require('./models/user.js'); // get our mongoose model
const tokenChecker = require('./tokenChecker.js');

// Questa rotta deve essere autenticata
router.get('/me', tokenChecker, async (req, res) => {
    if(!req.loggedUser) {
        res.status(400).json({ error: 'You have to login!' });
        return;
    }

    // https://mongoosejs.com/docs/api.html#model_Model.find
    let user = await User.findOne({email: req.loggedUser.email});

    res.status(200).json({
        self: '/api/v1/users/' + user.id,
        email: user.email,
        pictures : user.pictures
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
        pictures: []
    });
    
    if (!user.email || typeof user.email != 'string' || !checkIfEmailInString(user.email)) {
        res.status(400).json({ error: 'The field "email" must be a non-empty string, in email format' });
        return;
    }
    let userExists = await  userAlreadyExists(user.email);
    if (userExists) {
        res.status(400).json({ error: 'A user with that email already exists.' });
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


async function userAlreadyExists(e) {
    let userExists = await User.exists({ email: e });
    return userExists;
}



module.exports = router;