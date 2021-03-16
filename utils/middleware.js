const { campgroundSchema } = require("../schema");
const YelpCampError = require("./YelpCampError");

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) throw new YelpCampError(error.details.map(_ => _.message).join(','), 400);
    else next();
}

module.exports = { validateCampground };