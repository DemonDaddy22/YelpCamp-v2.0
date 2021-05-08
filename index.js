if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const YelpCampError = require('./utils/YelpCampError');
const { setLocals } = require('./utils/middleware');
const User = require('./models/User');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL;
// 'mongodb://localhost:27017/yelpcamp'
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
});

const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('> Database connection established'));

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(helmet());

const scriptSrcUrls = [
    'https://stackpath.bootstrapcdn.com',
    'https://api.tiles.mapbox.com',
    'https://api.mapbox.com',
    'https://kit.fontawesome.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
    'https://kit-free.fontawesome.com',
    'https://stackpath.bootstrapcdn.com',
    'https://api.mapbox.com',
    'https://api.tiles.mapbox.com',
    'https://fonts.googleapis.com',
    'https://use.fontawesome.com',
    'https://cdn.jsdelivr.net/',
];
const connectSrcUrls = ['https://api.mapbox.com', 'https://*.tiles.mapbox.com', 'https://events.mapbox.com'];
const fontSrcUrls = ['https://cdn.jsdelivr.net/'];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            childSrc: ['blob:'],
            objectSrc: [],
            imgSrc: [
                "'self'",
                'blob:',
                'data:',
                'https://res.cloudinary.com/yelp-camp/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                'https://images.unsplash.com',
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const sessionConfig = {
    name: 'session',
    secret: 'canbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(setLocals);

app.listen(PORT, () => console.log(`> Server started on Port: ${PORT}`));

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

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
        case 500:
        default:
            description = 'Oh no! Something went wrong!';
            break;
    }
    description += ' Click on the button below to go back to the homepage.';
    res.status(statusCode).render('error', { message, statusCode, description });
});
