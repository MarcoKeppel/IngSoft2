const express = require('express');
const router = express.Router();
const Post = require('./models/post.js'); // get our mongoose model
const User = require('./models/user.js'); // get our mongoose model
const tokenChecker = require('./tokenChecker.js');

router.get("", async (req, res) => {
	// Get all users from DB
	let users = await User.find().select("email posts -_id").populate({ path: "posts", select: "title" }).lean();

	console.log(users);

	posts = [];

	users.forEach( (user, u_index) => {
		users[u_index].posts.forEach((post, p_index) => {
			users[u_index].posts[p_index].user = user.email;
			posts.push(users[u_index].posts[p_index]);
		});
	});
	posts.sort( (a, b) => {
		return b.time - a.time;
	});

	res.json(posts);
});

router.get("/me", tokenChecker, async (req, res) => {
	// Get all users from DB
	if(!req.loggedUser) {
        res.status(400).json({ error: 'You have to login!' });
        return;
    }

	let user = await User.findOne({username: req.params.username}).select('email posts -_id').populate('posts', 'title').lean();

	let posts = user.posts;
	posts.sort( (a, b) => {
		return b.time - a.time;
	});

	res.json(posts);
});

router.get("/:username", async (req, res) => {
	if(!req.params.username){
        res.status(400).json({ error: 'You have to specify a username!' });
        return;
    }

	// Get all users from DB
	let user = await User.findOne({username: req.params.username}).select('email posts -_id').populate('posts', 'title').lean();

	if(!user){
		res.status(400).json({ error: 'User not found!' });
		return;
	}
	let posts = user.posts;
	posts.sort( (a, b) => {
		return b.time - a.time;
	});

	res.json(posts);
});

module.exports = router;