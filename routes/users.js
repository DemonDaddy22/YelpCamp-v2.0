const express = require('express');
const router = express.Router();
const User = require('../models/User');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

router.get('/register', (req, res) => {
    res.render('users/new');
});

router.post(
    '/',
    asyncErrorHandler(async (req, res) => {
        try {
            const { email, password, username, firstname, lastname } = req.body.user;
            const user = new User({ email, username, firstname, lastname });
            const registeredUser = await User.register(user, password);
            req.flash('success', `Successfully signed you up, ${username}!`);
            res.redirect('/campgrounds');
        } catch (e) {
            req.flash('error', e.message);
            res.redirect('/users/register');
        }
    })
);

module.exports = router;
