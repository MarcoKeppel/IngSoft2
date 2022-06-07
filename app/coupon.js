const express = require('express');
const router = express.Router();
const tokenChecker = require('./tokenChecker');
const User = require('./models/user.js');
const path = require('path');

router.get('/:username', tokenChecker, async (req, res) => {
    let user = await User.findOne({ username: req.loggedUser.username });

    if (!user) {
        res.status(400).json({ error: 'User not found!' });
        return;
    }

    if (!(req.params.username == req.loggedUser.username)) {
        res.status(400).json({ success: false, message: 'You have to be on your profile!' });
        return;
    }

    res.status(400).json({ success: true, redirect_path: "../coupon.html" });
});

router.get('/update/:username/:points', tokenChecker, async (req, res) => {
    let user = await User.findOne({ username: req.loggedUser.username });
    if (!user) {
        res.status(400).json({ error: 'User not found!' });
        return;
    }

    if (!(req.params.username == req.loggedUser.username)) {
        res.status(400).json({ success: false, message: 'You have to be on your profile!' });
        return;
    }

    if (user.couponPoints >= req.params.points) {
        let filter = { username: req.loggedUser.username };
        let update = { couponPoints: user.couponPoints - req.params.points};

        await User.findOneAndUpdate(filter, update, {new: true})
        res.status(400).json({ success: true, message: "The purchase was successful, you have still " + user.couponPoints + " points"});
    } else
        res.status(400).json({ success: false, message: "You don't have enough points (" + user.couponPoints + " points)" });

});

module.exports = router;