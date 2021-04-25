const express = require('express');
const passport = require('passport');
const { getRegisterUserForm, createNewUser, getLoginUserForm, loginUser, logoutUser } = require('../controllers/users');
const router = express.Router();
const asyncErrorHandler = require('../utils/asyncErrorHandler');

router.get('/register', getRegisterUserForm);

router.post('/', asyncErrorHandler(createNewUser));

router.get('/login', getLoginUserForm);

router.post(
    '/login',
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/users/login' }),
    asyncErrorHandler(loginUser)
);

router.get('/logout', logoutUser);

module.exports = router;
