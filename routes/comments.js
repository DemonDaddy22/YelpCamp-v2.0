const express = require('express');
const Campground = require('../models/Campground');
const Comment = require('../models/Comment');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateComment } = require('../utils/middleware');
const router = express.Router({ mergeParams: true });

router.post('/', validateComment, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
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
    const comment = await Comment.findById(commentId);
    res.render('comments/edit', { campground, comment });
}));

router.patch('/:commentId', validateComment, asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findById(id);
    await Comment.findByIdAndUpdate(commentId, req.body.comment, { new: true, runValidators: true });
    req.flash('success', 'Comment updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete('/:commentId', asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { comments: commentId } }, { new: true });
    req.flash('success', 'Comment deleted successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

module.exports = router;