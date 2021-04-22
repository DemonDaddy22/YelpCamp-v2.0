const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: [true, 'First name is required'],
    },
    lastname: {
        type: String,
        required: [true, 'Last name is required'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    }
});

// passportLocalMongoose automatically assigns a unique username, hashed password and salt value to the user model behind the scenes
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);