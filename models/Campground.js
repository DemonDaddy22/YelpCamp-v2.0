const mongoose = require('mongoose');
const Comment = require('./Comment');
const Review = require('./Review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String,
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_50,h_50');
});

const CampgroundSchema = new Schema(
    {
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
        images: [ImageSchema],
        location: {
            type: String,
        },
        geoLocation: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
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
    },
    { toJSON: { virtuals: true } }
);

CampgroundSchema.virtual('properties.popupMarkup').get(function () {
    return `
    <strong>
        <a href='/campgrounds/${this._id}'>${this.title}</a>
    </strong>
    <p>${this.description?.substring(0, 50)}...</p>
    `;
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
