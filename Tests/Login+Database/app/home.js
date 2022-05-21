const express = require('express');
const router = express.Router();

router.post('', async function(req, res) {
	
	res.json({
		success: true,
		message: 'Welcome to your home',
        user: req.loggedUser
	});

});

module.exports = router;