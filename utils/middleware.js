const { campgroundSchema, ratingSchema } = require("../schema");
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

const validateRating = (req, res, next) => middlewareHelper(ratingSchema, req, res, next);

module.exports = { validateCampground, validateRating };