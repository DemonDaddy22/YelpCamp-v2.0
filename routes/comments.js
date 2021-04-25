const express = require('express');
const { createNewComment, getEditCommentForm, editComment, deleteComment } = require('../controllers/comments');
const Campground = require('../models/Campground');
const Comment = require('../models/Comment');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateComment, isLoggedIn, isCommentAuthor } = require('../utils/middleware');
const router = express.Router({ mergeParams: true });

router.post('/', isLoggedIn, validateComment, asyncErrorHandler(createNewComment));

router.get('/:commentId/edit', isLoggedIn, isCommentAuthor, asyncErrorHandler(getEditCommentForm));

router.patch('/:commentId', isLoggedIn, validateComment, isCommentAuthor, asyncErrorHandler(editComment));

router.delete('/:commentId', isLoggedIn, isCommentAuthor, asyncErrorHandler(deleteComment));

module.exports = router;
