const { campgroundSchema } = require("../schema");
const YelpCampError = require("./YelpCampError");

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        if (error.isJoi) throw new YelpCampError(error.details.map(_ => _.message).join(','), 422);
        else throw new YelpCampError('Bad Request!', 400);
    }
    else next();
}

module.exports = { validateCampground };