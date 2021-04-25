const Campground = require('../models/Campground');
const Review = require('../models/Review');
const { campgroundSchema, reviewSchema, commentSchema } = require('../schema');
const YelpCampError = require('./YelpCampError');

const schemaValidator = (schema, req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        if (error.isJoi) throw new YelpCampError(error.details.map(_ => _.message).join(','), 422);
        else throw new YelpCampError('Bad Request!', 400);
    } else next();
};

const validateCampground = (req, res, next) => schemaValidator(campgroundSchema, req, res, next);

const validateReview = (req, res, next) => schemaValidator(reviewSchema, req, res, next);

const validateComment = (req, res, next) => schemaValidator(commentSchema, req, res, next);

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash('error', 'You must be logged in to do that.');
        return res.redirect('/users/login');
    }
    next();
};

const isCampgroundAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You are not authorised to perform that action');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You are not authorised to perform that action');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

const setLocals = (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    res.locals.currentUrl = req.originalUrl;
    next();
};

module.exports = {
    validateCampground,
    validateReview,
    validateComment,
    setLocals,
    isLoggedIn,
    isCampgroundAuthor,
    isReviewAuthor,
};
