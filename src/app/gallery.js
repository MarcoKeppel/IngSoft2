const express = require('express');
const router = express.Router();
const Picture = require('./models/picture.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model

router.get("", async (req, res) => {
    
	res.send();
});

module.exports = router;