const { campgroundSchema, reviewSchema, commentSchema } = require("../schema");
const YelpCampError = require("./YelpCampError");

const middlewareHelper = (schema, req, res, next) => {
    const {error} = schema.validate(req.body);
    if (error) {
        if (error.isJoi) throw new YelpCampError(error.details.map(_ => _.message).join(','), 422);
        else throw new YelpCampError('Bad Request!', 400);
    }
    else next();
};

const validateCampground = (req, res, next) => middlewareHelper(campgroundSchema, req, res, next);

const validateReview = (req, res, next) => middlewareHelper(reviewSchema, req, res, next);

const validateComment = (req, res, next) => middlewareHelper(commentSchema, req, res, next);

module.exports = { validateCampground, validateReview, validateComment };