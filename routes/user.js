/*  User routes */

var express = require('express');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var mdAuthentication = require('../middlewares/authentication');
var Responses = require('../shared/serviceResponses');

var app = express();
var responses = new Responses();


// ----------------
// Get all users 
// ----------------
app.get('/', (req, res, next) => {
    var from = req.query.from || 0;
    from = Number(from);

    User.find({}, 'name surname email img role')
        .skip(from)
        .exec((err, users) => {
            if (err) {
                return responses.internalErrorServer(err, res, 'Error loading users from database.');
            }
            User.count({}, (err, totalUsers) => {
                res.status(200).json({
                    ok: true,
                    totalUsers: totalUsers,
                    Users: users
                });
            });

        });
});

// ----------------
// Update user
// ----------------
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    // Search for user by id in the DB
    User.findById(id, (err, user) => {
        if (err) {
            return responses.internalErrorServer(err, res, 'Error searching the user');
        }
        if (!user) {
            return responses.badRequestAuth(`User by ID: ${id} was not fount`, res);
        }
        // if user not null and there are not errors, the data can be updated
        user.name = body.name;
        user.surname = body.surname;
        user.email = body.email;
        user.role = body.role;
        user.save((err, savedUser) => {
            if (err) {
                return responses.internalErrorServer(err, res, 'Error updating user');
            }
            responses.elementCreated(savedUser, res);
        });
    });
});

// ----------------
// Create user
// ----------------
app.post('/', mdAuthentication.verifyToken, (req, res) => {
    var body = req.body;
    var user = new User({
        name: body.name,
        surname: body.surname,
        password: bcrypt.hashSync(body.password, 10),
        email: body.email,
        img: body.img,
        role: body.role
    });

    user.save((err, savedUser) => {
        if (err) {
            return responses.internalErrorServer(err, res, 'Error crating user');
        }
        responses.elementCreated(savedUser, res);
    });
});

// ----------------
// Delete user
// ----------------
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;
    User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return responses.internalErrorServer(err, res, 'Error deleting user.');
        }
        if (!deletedUser) {
            return responses.badRequestAuth(`Do not exist an user by ID: ${id}`, res);
        }
        responses.elementDeleted(deletedUser, res);
    });
});

module.exports = app;