if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const mongoose = require('mongoose');
const Campground = require('../models/Campground');
const cities = require('./cities');
const { places, descriptors } = require('./helper');

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', err => console.error(err));
db.once('open', () => console.log('> Database connection established'));

const getRandomNum = max => Math.floor(Math.random() * max);

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const citiesIndex = getRandomNum(cities.length);
        const placesIndex = getRandomNum(places.length);
        const descriptorsIndex = getRandomNum(descriptors.length);

        const campground = new Campground({
            author: process.env.AUTHOR_ID,
            title: `${descriptors[descriptorsIndex]} ${places[placesIndex]}`,
            price: `${getRandomNum(25)}`,
            description: 'hope plant mean outline welcome include process physical jet becoming sharp friend',
            location: `${cities[citiesIndex].city}, ${cities[citiesIndex].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/yelp-camp/image/upload/v1619521480/YelpCamp-v2.0/yukfzvnofgwysje2bf9b.jpg',
                    filename: 'YelpCamp-v2.0/yukfzvnofgwysje2bf9b',
                },
                {
                    url: 'https://res.cloudinary.com/yelp-camp/image/upload/v1619521483/YelpCamp-v2.0/xjslzd31obvjb3dxpbgp.jpg',
                    filename: 'YelpCamp-v2.0/xjslzd31obvjb3dxpbgp',
                },
            ],
        });

        await campground.save();
    }
};

seedDB().then(() => db.close());
