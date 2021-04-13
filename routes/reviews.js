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
    req.flash('success', 'Review added successfully!');
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
    req.flash('success', 'Review updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete('/:reviewId', asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true });
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

module.exports = router;