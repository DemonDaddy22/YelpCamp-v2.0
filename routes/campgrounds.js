const express = require('express');
const Campground = require('../models/Campground');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateCampground } = require('../utils/middleware');
const router = express.Router();

router.get('/', asyncErrorHandler(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

router.get('/:id', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews').populate('comments');
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/details', { campground });
}));

router.post('/', validateCampground, asyncErrorHandler(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    const response = await campground.save();
    req.flash('success', 'Campground created successfully!');
    res.redirect(`/campgrounds/${response?.id}`);
}));

router.get('/:id/edit', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

router.patch('/:id', validateCampground, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true });
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    req.flash('success', 'Campground updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete('/:id', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds');
}));

module.exports = router;