const express = require('express');
const Campground = require('../models/Campground');
const Review = require('../models/Review');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateReview, isLoggedIn } = require('../utils/middleware');
const router = express.Router({ mergeParams: true });

router.post('/', isLoggedIn, validateReview, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const review = new Review(req.body.review);
    campground.reviews.unshift(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review added successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.get('/:reviewId/edit', isLoggedIn, asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found.');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    res.render('reviews/edit', { campground, review });
}));

router.patch('/:reviewId', isLoggedIn, validateReview, asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const review = await Review.findByIdAndUpdate(reviewId, req.body.review, { new: true, runValidators: true });
    if (!review) {
        req.flash('error', 'Review not found.');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    req.flash('success', 'Review updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete('/:reviewId', isLoggedIn, asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true });
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
        req.flash('error', 'Review not found.');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

module.exports = router;