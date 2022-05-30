const express = require('express');
const router = express.Router();
const Picture = require('./models/picture.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const tokenChecker = require('./tokenChecker.js');

router.get("", async (req, res) => {
	// Get all users from DB
	let users = await User.find().select('email pictures -_id').populate('pictures', 'time path -_id').lean();

	pictures = [];

	users.forEach( (user, u_index) => {
		users[u_index].pictures.forEach((picture, p_index) => {
			users[u_index].pictures[p_index].user = user.email;
			pictures.push(users[u_index].pictures[p_index]);
		});
	});
	pictures.sort( (a, b) => {
		return b.time - a.time;
	});

	res.json(pictures);
});

router.get("/me", tokenChecker, async (req, res) => {
	// Get all users from DB
	if(!req.loggedUser) {
        res.status(400).json({ error: 'You have to login!' });
        return;
    }

	let user = await User.findOne({_id: req.loggedUser.id}).select('email pictures -_id').populate('pictures', 'time path -_id').lean();

	let pictures = user.pictures;
	pictures.sort( (a, b) => {
		return b.time - a.time;
	});

	res.json(pictures);
});

router.get("/:username", async (req, res) => {
	if(!req.params.username){
        res.status(400).json({ error: 'You have to specify a username!' });
        return;
    }

	// Get all users from DB
	let user = await User.findOne({username: req.params.username}).select('email pictures -_id').populate('pictures', 'time path -_id').lean();

	if(!user){
		res.status(400).json({ error: 'User not found!' });
		return;
	}
	
	let pictures = user.pictures;
	pictures.sort( (a, b) => {
		return b.time - a.time;
	});

	res.json(pictures);
});

module.exports = router;