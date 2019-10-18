/*  Login routes */

var express = require('express');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

app.post('', (req, res) => {
    var body = req.body;
    User.findOne({
        email: body.email
    }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error looking for the user',
                errors: err
            });
        }
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Wrong user info -email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Wrong user info -password',
                errors: err
            });
        }
        // Create token
        userDB.password = ':)';
        var token = jwt.sign({
            user: userDB
        }, SEED, {
            expiresIn: 14400 //4 hours
        });

        res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB.id
        });
    });
});



module.exports = app;