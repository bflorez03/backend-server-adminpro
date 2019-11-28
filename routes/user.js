/*  User routes */

var express = require('express');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var mdAuthentication = require('../middlewares/authentication');
var Responses = require('../shared/serviceResponses');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Menu = require('../shared/menu')

var app = express();
var response = new Responses();


// ----------------
// Get all users 
// ----------------
app.get('/', (req, res, next) => {
    var from = req.query.from || 0;
    from = Number(from);

    User.find({}, 'name surname email img role google')
        .skip(from)
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return response.internalErrorServer(err, res, 'Error loading users from database.');
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
app.put('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminRoleOrSameUser], (req, res) => {
    var id = req.params.id;
    var body = req.body;
    // Search for user by id in the DB
    User.findById(id, (err, user) => {
        if (err) {
            return response.internalErrorServer(err, res, 'Error searching the user');
        }
        if (!user) {
            return response.badRequestAuth(`User by ID: ${id} was not fount`, res);
        }
        // if user not null and there are not errors, the data can be updated
        user.name = body.name;
        user.surname = body.surname;
        user.email = body.email;
        user.role = body.role;
        user.save((err, savedUser) => {
            if (err) {
                return response.internalErrorServer(err, res, 'Error updating user');
            }
            var token = jwt.sign({ user: savedUser }, SEED, { expiresIn: 14400 }); // 4 hours
            return res.status(200).json({
                ok: true,
                user: savedUser,
                token: token,
                id: savedUser.id,
                menu: Menu.getMenu(savedUser.role)
            });
        });
    });
});

// ----------------
// Create user
// ----------------
app.post('/', (req, res) => {
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
            return response.internalErrorServer(err, res, 'Error crating user');
        }
        response.elementCreated(savedUser, res);
    });
});

// ----------------
// Delete user
// ----------------
app.delete('/:id', [mdAuthentication.verifyToken, mdAuthentication.verifyAdminRole], (req, res) => {
    var id = req.params.id;
    User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return response.internalErrorServer(err, res, 'Error deleting user.');
        }
        if (!deletedUser) {
            return response.badRequestAuth(`Do not exist an user by ID: ${id}`, res);
        }
        response.elementDeleted(deletedUser, res);
    });
});

module.exports = app;