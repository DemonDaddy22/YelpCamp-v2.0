const express = require('express');
const { createNewReview, getEditReviewForm, editReview, deleteReview } = require('../controllers/reviews');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../utils/middleware');
const router = express.Router({ mergeParams: true });

router.post('/', isLoggedIn, validateReview, asyncErrorHandler(createNewReview));

router.get('/:reviewId/edit', isLoggedIn, isReviewAuthor, asyncErrorHandler(getEditReviewForm));

router.patch('/:reviewId', isLoggedIn, validateReview, isReviewAuthor, asyncErrorHandler(editReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, asyncErrorHandler(deleteReview));

module.exports = router;
