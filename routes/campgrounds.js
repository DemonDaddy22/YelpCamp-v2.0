const express = require('express');
const Campground = require('../models/Campground');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateCampground, isLoggedIn, isCampgroundAuthor } = require('../utils/middleware');
const router = express.Router();

router.get(
    '/',
    asyncErrorHandler(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds });
    })
);

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.get(
    '/:id',
    asyncErrorHandler(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id)
            .populate({ path: 'reviews', populate: { path: 'author' } })
            .populate('comments')
            .populate('author');
        if (!campground) {
            req.flash('error', 'Campground not found');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/details', { campground });
    })
);

router.post(
    '/',
    isLoggedIn,
    validateCampground,
    asyncErrorHandler(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        const response = await campground.save();
        req.flash('success', 'Campground created successfully!');
        res.redirect(`/campgrounds/${response?.id}`);
    })
);

router.get(
    '/:id/edit',
    isLoggedIn,
    isCampgroundAuthor,
    asyncErrorHandler(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render('campgrounds/edit', { campground });
    })
);

router.patch(
    '/:id',
    isLoggedIn,
    validateCampground,
    isCampgroundAuthor,
    asyncErrorHandler(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true });
        req.flash('success', 'Campground updated successfully!');
        res.redirect(`/campgrounds/${campground.id}`);
    })
);

router.delete(
    '/:id',
    isLoggedIn,
    isCampgroundAuthor,
    asyncErrorHandler(async (req, res) => {
        const { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    })
);

module.exports = router;
