const mongoose = require('mongoose');
const Comment = require('./Comment');
const Review = require('./Review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [
        {
            url: String,
            filename: String,
        },
    ],
    location: {
        type: String,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
});

// mongoose middleware which needs to be configured before model creation
// post hook for the model - contains the document info
// this will ensure that all the reviews and comments attached to the campground also get deleted
CampgroundSchema.post('findOneAndDelete', async doc => {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc?.reviews } });
        await Comment.deleteMany({ _id: { $in: doc?.comments } });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);
