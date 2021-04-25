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
        unique: true,
    },
});

UserSchema.post('save', (err, _, next) => {
    if (err.name === 'MongoError' && err.code === 11000) next(new Error('A user with the given email is already registered'));
    else next();
});

// passportLocalMongoose automatically assigns a unique username, hashed password and salt value to the user model behind the scenes
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
