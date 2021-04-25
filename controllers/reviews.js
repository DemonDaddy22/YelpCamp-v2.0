const Campground = require('../models/Campground');
const Review = require('../models/Review');

const createNewReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.unshift(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review added successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
};

const getEditReviewForm = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);
    res.render('reviews/edit', { campground, review });
};

const editReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findById(id);
    await Review.findByIdAndUpdate(reviewId, req.body.review, { new: true, runValidators: true });
    req.flash('success', 'Review updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
};

const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
};

module.exports = { createNewReview, getEditReviewForm, editReview, deleteReview };
