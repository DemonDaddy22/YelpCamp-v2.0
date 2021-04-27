const Joi = require('joi');

const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
    }).required(),
});

const reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required(),
});

const commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required(),
    }).required(),
});

module.exports = { campgroundSchema, reviewSchema, commentSchema };

// TODO - validate user