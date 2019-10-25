var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var validRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is a forbidden role'
};

var userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is needed'],
    },
    surname: {
        type: String,
        required: [true, 'Surname is needed'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is needed'],
    },
    password: {
        type: String,
        required: [true, 'Password is needed'],
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        default: 'USER_ROLE',
        enum: validRoles
    },
    google: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(uniqueValidator, {
    message: '{PATH} has to be unique'
});

module.exports = mongoose.model('user', userSchema);
