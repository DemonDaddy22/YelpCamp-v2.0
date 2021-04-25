const express = require('express');
const {
    getAllCamprounds,
    getNewCampgroundForm,
    getCampground,
    createNewCampground,
    getEditCampgroundForm,
    editCampground,
    deleteCampground,
} = require('../controllers/campgrounds');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const { validateCampground, isLoggedIn, isCampgroundAuthor } = require('../utils/middleware');
const router = express.Router();

router.get('/', asyncErrorHandler(getAllCamprounds));

router.get('/new', isLoggedIn, getNewCampgroundForm);

router.get('/:id', asyncErrorHandler(getCampground));

router.post('/', isLoggedIn, validateCampground, asyncErrorHandler(createNewCampground));

router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, asyncErrorHandler(getEditCampgroundForm));

router.patch('/:id', isLoggedIn, validateCampground, isCampgroundAuthor, asyncErrorHandler(editCampground));

router.delete('/:id', isLoggedIn, isCampgroundAuthor, asyncErrorHandler(deleteCampground));

module.exports = router;
