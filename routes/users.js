const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

const greeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    if (hours < 24) return 'Good Evening';
};

router.get('/register', (req, res) => {
    res.render('users/new');
});

router.post(
    '/',
    asyncErrorHandler(async (req, res, next) => {
        try {
            const { email, password, username, firstname, lastname } = req.body.user;
            const user = new User({ email, username, firstname, lastname });
            const registeredUser = await User.register(user, password);
            req.login(registeredUser, err => {
                if (err) return next(err);
                req.flash('success', `Successfully signed you up, ${firstname}!`);
                res.redirect('/campgrounds');
            });
        } catch (e) {
            req.flash('error', e.message);
            res.redirect('/users/register');
        }
    })
);

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post(
    '/login',
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login' }),
    asyncErrorHandler(async (req, res) => {
        req.flash('success', `${greeting()}, ${req.body.username}!`);
        res.redirect('/campgrounds');
    })
);

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Hoping to see you soon!');
    res.redirect('/campgrounds');
});

module.exports = router;
