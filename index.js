const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const YelpCampError = require('./utils/YelpCampError');
const asyncErrorHandler = require('./utils/asyncErrorHandler');
const { validateCampground, validateReview, validateComment } = require('./utils/middleware');
const Campground = require('./models/Campground');
const Review = require('./models/Review');
const Comment = require('./models/Comment');

mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('> Database connection established'));

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.listen(PORT, () => console.log(`> Server started on Port: ${PORT}`));

app.get('/', (req, res) => {
    res.redirect('/campgrounds');
});

app.get('/campgrounds', asyncErrorHandler(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews').populate('comments');
    res.render('campgrounds/details', { campground });
}));

app.post('/campgrounds', validateCampground, asyncErrorHandler(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    const response = await campground.save();
    res.redirect(`/campgrounds/${response?.id}`);
}));

app.get('/campgrounds/:id/edit', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}));

app.patch('/campgrounds/:id', validateCampground, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { new: true, runValidators: true });
    res.redirect(`/campgrounds/${campground.id}`);
}));

app.delete('/campgrounds/:id', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.unshift(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', asyncErrorHandler(async (req, res) => {
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }, { new: true });
    res.redirect(`/campgrounds/${campground.id}`);
}));

app.post('/campgrounds/:id/comments', validateComment, asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const comment = new Comment(req.body.comment);
    campground.comments.unshift(comment);
    await comment.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
}));

app.delete('/campgrounds/:id/comments/:commentId', asyncErrorHandler(async (req, res) => {
    const { id, commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { comments, commentId } }, { new: true });
    res.redirect(`/campgrounds/${campground.id}`);
}));

app.all('*', (req, res, next) => {
    next(new YelpCampError('Uh-Oh!', 404));
});

// error handling middleware
app.use((err, req, res, next) => {
    let { message = 'Uh-Oh!', statusCode = 500 } = err;
    let description = '';
    switch (statusCode) {
        case 400:
            description = 'The server could not understand the request due to invalid syntax!';
            break;
        case 401:
            description = 'You are not authorized to perform this action!';
            break;
        case 403:
            description = 'You cannot perform this action!';
            break;
        case 404:
            description = 'The page you are looking for does not exist!';
            break;
        case 500: default:
            description = 'Oh no! Something went wrong!';
            break;
    }
    description += ' Click on the button below to go back to the homepage.';
    res.status(statusCode).render('error', { message, statusCode, description });
});