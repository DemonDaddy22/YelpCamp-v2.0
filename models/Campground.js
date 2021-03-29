const mongoose = require('mongoose');
const Review = require('./Review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    location: {
        type: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

// mongoose middleware which needs to be configured before model creation
// post hook for the model - contains the document info
// this will ensure that all the reviews attached to the campground also get deleted
CampgroundSchema.post('findOneAndDelete', async doc => {
    if (doc) await Review.deleteMany({ _id: { $in: doc?.reviews } });
});

module.exports = mongoose.model('Campground', CampgroundSchema);