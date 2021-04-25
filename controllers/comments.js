const Campground = require('../models/Campground');
const Comment = require('../models/Comment');

const createNewComment = async (req, res) => {
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
};

const getEditCommentForm = async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findById(id);
    const comment = await Comment.findById(commentId);
    res.render('comments/edit', { campground, comment });
};

const editComment = async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findById(id);
    await Comment.findByIdAndUpdate(commentId, req.body.comment, { new: true, runValidators: true });
    req.flash('success', 'Comment updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
};

const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { comments: commentId } }, { new: true });
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Comment deleted successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
};

module.exports = { createNewComment, getEditCommentForm, editComment, deleteComment };
