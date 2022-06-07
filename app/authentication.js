const express = require('express');
const router = express.Router();
const User = require('./models/user.js'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const tokenChecker = require('./tokenChecker.js');


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
		res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
		return;
	}
	
	// check if password matches
	
	if (user.password != req.body.password) {
		res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
		return;
	}
	
	// if user is found and password is right create a token
	var payload = {
		email: user.email,
		id: user._id,
		username: user.username
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: 86400 // expires in 24 hours
	}
	var token = jwt.sign(payload, process.env.SUPER_SECRET, options); // We should use the enviroment

	res.cookie('token', token);
	
	res.redirect("/");
});

module.exports = router;