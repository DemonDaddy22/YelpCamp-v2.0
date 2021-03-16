const Joi = require('joi');

const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.string().required()
    }).required()
});

module.exports = { campgroundSchema };