const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary-config');
const upload = multer({ storage });
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

router.post('/', isLoggedIn, upload.array('images'), validateCampground, asyncErrorHandler(createNewCampground));

router.get('/:id/edit', isLoggedIn, isCampgroundAuthor, asyncErrorHandler(getEditCampgroundForm));

router.patch('/:id', isLoggedIn, validateCampground, isCampgroundAuthor, asyncErrorHandler(editCampground));

router.delete('/:id', isLoggedIn, isCampgroundAuthor, asyncErrorHandler(deleteCampground));

module.exports = router;
