const express = require('express');
const router = express.Router();
const Picture = require('./models/picture.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model

router.get("", async (req, res) => {
    
	// Thanks to tokenChecker(), we can assume that the user is authenticated

	// Get all users from DB
	let users = await User.find().populate('pictures');

	console.log(users);

	pictures = [];

	users.forEach( (user, u_index) => {
		users[u_index].pictures.forEach((picture, p_index) => {
			users[u_index].pictures[p_index].user = user.email
			pictures.push(users[u_index].pictures[p_index]);
		});
	});
	pictures.sort( (a, b) => {
		return b.time - a.time;
	});
	console.log(pictures);

	res.json(pictures);
});

module.exports = router;