const express = require('express');
const router = express.Router();
const User = require('./models/user'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens


// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.post('', async function(req, res) {
	
	// find the user

	let user = await User.findOne({
		email: req.body.email
	}).exec();
	
	// user not found
	if (!user) {
		res.json({ success: false, message: 'Authentication failed. User not found.' });
		return;
	}
	
	// check if password matches
	
	if (user.password != req.body.password) {
		res.json({ success: false, message: 'Authentication failed. Wrong password.' });
		return;
	}
	
	// if user is found and password is right create a token
	var payload = {
		email: user.email,
		id: user._id
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: 86400 // expires in 24 hours
	}
	var token = jwt.sign(payload, "127E6RR5e725D583a2476", options); // We should use the enviroment

	res.json({
		success: true,
		message: 'Enjoy your token!',
		token: token,
		email: user.email,
		id: user._id,
		self: "api/v1/" + user._id
	});

});

module.exports = router;