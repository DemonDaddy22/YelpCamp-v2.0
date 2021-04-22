const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// passportLocalMongoose automatically assigns a unique username, hashed password and salt value to the user model behind the scenes
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);