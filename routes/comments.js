const express = require('express');
const Campground = require('../models/Campground');
const Comment = require('../models/Comment');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateComment, isLoggedIn, isCommentAuthor } = require('../utils/middleware');
const router = express.Router({ mergeParams: true });

router.post('/', isLoggedIn, validateComment, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    campground.comments.unshift(comment);
    await comment.save();
    await campground.save();
    req.flash('success', 'Comment added successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.get('/:commentId/edit', isLoggedIn, isCommentAuthor, asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findById(id);
    const comment = await Comment.findById(commentId);
    res.render('comments/edit', { campground, comment });
}));

router.patch('/:commentId', isLoggedIn, validateComment, isCommentAuthor, asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findById(id);
    await Comment.findByIdAndUpdate(commentId, req.body.comment, { new: true, runValidators: true });
    req.flash('success', 'Comment updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

router.delete('/:commentId', isLoggedIn, isCommentAuthor, asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { comments: commentId } }, { new: true });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Comment deleted successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
}));

module.exports = router;