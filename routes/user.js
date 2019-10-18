/*  User routes */

var express = require('express');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var mdAuthentication = require('../middlewares/authentication');

var app = express();

// ----------------
// Get all users 
// ----------------
app.get('/', (req, res, next) => {
    User.find({}, 'name surname email img role')
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading users from database.',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                Users: users
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
            return res.status(500).json({
                ok: false,
                message: 'Error searching the user',
                errors: err
            });
        }
        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'User by id ' + id + ' was not fount',
                errors: {
                    message: 'Do not exist user by that ID'
                }
            });
        }
        // if user not null and there are not errors, the data can be updated
        user.name = body.name;
        user.surname = body.surname;
        user.email = body.email;
        user.role = body.role;
        user.save((err, savedUser) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error updating user',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                user: savedUser
            });
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
            return res.status(400).json({
                ok: false,
                message: 'Error creating user',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            user: savedUser
        });
    });
});

// ----------------
// Delete user
// ----------------
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var id = req.params.id;
    User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting user.',
                errors: err
            });
        }
        if (!deletedUser) {
            return res.status(400).json({
                ok: false,
                message: 'Do not exist user by this ID',
                errors: {
                    message: 'Do not exist an user by ID: ' + id
                }
            });
        }
        res.status(200).json({
            ok: true,
            user: deletedUser
        });

    });
});

module.exports = app;