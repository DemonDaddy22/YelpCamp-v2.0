const User = require('../models/User');

const greeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    if (hours < 24) return 'Good Evening';
};

const getRegisterUserForm = (req, res) => {
    res.render('users/new');
};

const createNewUser = async (req, res, next) => {
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
};

const getLoginUserForm = (req, res) => {
    res.render('users/login');
};

const loginUser = async (req, res) => {
    req.flash('success', `${greeting()}, ${req.body.username}!`);
    const redirectUrl = req.session.redirectUrl || '/campgrounds';
    delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};

const logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'Hoping to see you soon!');
    res.redirect('/campgrounds');
};

module.exports = { getRegisterUserForm, createNewUser, getLoginUserForm, loginUser, logoutUser };
