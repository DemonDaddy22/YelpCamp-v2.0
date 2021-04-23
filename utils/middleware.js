const { campgroundSchema, reviewSchema, commentSchema } = require("../schema");
const YelpCampError = require("./YelpCampError");

const schemaValidator = (schema, req, res, next) => {
    const {error} = schema.validate(req.body);
    if (error) {
        if (error.isJoi) throw new YelpCampError(error.details.map(_ => _.message).join(','), 422);
        else throw new YelpCampError('Bad Request!', 400);
    }
    else next();
};

const validateCampground = (req, res, next) => schemaValidator(campgroundSchema, req, res, next);

const validateReview = (req, res, next) => schemaValidator(reviewSchema, req, res, next);

const validateComment = (req, res, next) => schemaValidator(commentSchema, req, res, next);

const flashMiddleware = (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
}

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in to do that.');
        return res.redirect('/users/login');
    }
    next();
}

module.exports = { validateCampground, validateReview, validateComment, flashMiddleware, isLoggedIn };