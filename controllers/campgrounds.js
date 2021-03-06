const Campground = require('../models/Campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { cloudinary } = require('../cloudinary-config');

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const getAllCamprounds = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};

const getNewCampgroundForm = (req, res) => {
    res.render('campgrounds/new');
};

const getCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate({ path: 'comments', populate: { path: 'author' } })
        .populate('author');
    if (!campground) {
        req.flash('error', 'Campground not found');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/details', { campground });
};

const createNewCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    const response = await campground.save();
    req.flash('success', 'Campground created successfully!');
    res.redirect(`/campgrounds/${response?.id}`);
};

const getEditCampgroundForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
};

const editCampground = async (req, res) => {
    const { id } = req.params;
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send();
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, {
        new: true,
        runValidators: true,
    });
    campground.geometry = geoData.body.features[0].geometry;
    campground.images.push(...req.files.map(file => ({ url: file.path, filename: file.filename })));
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) await cloudinary.uploader.destroy(filename);
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Campground updated successfully!');
    res.redirect(`/campgrounds/${campground.id}`);
};

const deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully!');
    res.redirect('/campgrounds');
};

module.exports = {
    getAllCamprounds,
    getNewCampgroundForm,
    getCampground,
    createNewCampground,
    getEditCampgroundForm,
    editCampground,
    deleteCampground,
};
