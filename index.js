const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/Campground');
const YelpCampError = require('./utils/YelpCampError');
const asyncErrorHandler = require('./utils/asyncErrorHandler');

mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('> Database connection established'));

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
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
    const campground = await Campground.findById(id);
    res.render('campgrounds/details', { campground });
}));

app.post('/campgrounds', asyncErrorHandler(async (req, res, next) => {
    const campground = new Campground({
        title: req.body.title || '',
        price: req.body.price || 0,
        description: req.body.description || '',
        location: req.body.location || '',
        image: req.body.image || ''
    });
    const response = await campground.save();
    res.redirect(`/campgrounds/${response?.id}`);
}));

app.get('/campgrounds/:id/edit', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground });
}));

app.patch('/campgrounds/:id', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.redirect(`/campgrounds/${campground.id}`);
}));

app.delete('/campgrounds/:id', asyncErrorHandler(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// error handling middleware
app.use((err, req, res, next) => {
    res.send('Oh no! Something went wrong.');
});