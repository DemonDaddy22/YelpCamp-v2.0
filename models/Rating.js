const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RatingSchema = new Schema({
    body: {
        type: String
    },
    rating: {
        type: Number,
        required: true
    }
});