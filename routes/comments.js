const express = require('express');
const Campground = require('../models/Campground');
const Comment = require('../models/Comment');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateComment } = require('../utils/middleware');
const router = express.Router({ mergeParams: true });

router.post('/', validateComment, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const comment = new Comment(req.body.comment);
    campground.comments.unshift(comment);
    await comment.save();
    await campground.save();
    req.flash('success', 'Comment added successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.get('/:commentId/edit', asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        req.flash('error', 'Comment not found.');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    res.render('comments/edit', { campground, comment });
}));

router.patch('/:commentId', validateComment, asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const comment = await Comment.findByIdAndUpdate(commentId, req.body.comment, { new: true, runValidators: true });
    if (!comment) {
        req.flash('error', 'Comment not found.');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    req.flash('success', 'Comment updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete('/:commentId', asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { comments: commentId } }, { new: true });
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
        req.flash('error', 'Comment not found.');
        return res.redirect(`/campgrounds/${campground.id}`);
    }
    req.flash('success', 'Comment deleted successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

module.exports = router;