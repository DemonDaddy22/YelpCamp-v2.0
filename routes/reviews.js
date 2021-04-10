const express = require('express');
const Campground = require('../models/Campground');
const Review = require('../models/Review');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateReview } = require('../utils/middleware');
const router = express.Router({ mergeParams: true });

router.post('/', validateReview, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.unshift(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.get('/:reviewId/edit', asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);
    res.render('reviews/edit', { campground, review });
}));

router.patch('/:reviewId', validateReview, asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndUpdate(reviewId, req.body.review, { new: true, runValidators: true });
    const campground = await Campground.findById(id);
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete('/:reviewId', asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true });
    res.redirect(`/campgrounds/${campground.id}`);
}));

module.exports = router;