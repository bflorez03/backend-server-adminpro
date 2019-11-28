/*  Login routes */

var express = require('express');
var bcrypt = require('bcryptjs');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Responses = require('../shared/serviceResponses');
var Menu = require('../shared/menu');

var app = express();
var responses = new Responses();

// Google authentication resources
var CLIENT_G_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_G_ID);

// Google token verification
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_G_ID,  // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();

    return {
        name: payload.given_name,
        surname: payload.family_name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
} verify().catch(console.error);

// ------------------------------------------
// Google authentication
// ------------------------------------------
app.post('/google', async (req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => responses.badRequestAuth('Token error', res));

    User.findOne({ email: googleUser.email }, (err, userFromDB) => {
        if (err) {
            return responses.internalErrorServer(err, res, 'Error looking for the user');
        }
        if (userFromDB) {
            if (userFromDB.google === false) {
                return responses.badRequestAuth('An user already exist with this account', res);
            } else {
                var token = jwt.sign({ user: userFromDB }, SEED, { expiresIn: 14400 }); // 4 hours
                return res.status(200).json({
                    ok: true,
                    user: userFromDB,
                    token: token,
                    id: userFromDB.id,
                    menu: Menu.getMenu(userFromDB.role)
                });
            }
        } else {
            // Doesn't exist user, create a new one
            var user = new User();

            user.name = googleUser.name;
            user.surname = googleUser.surname;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, savedUser) => {
                if (err) {
                    responses.internalErrorServer(err, res, 'Error looking for the user');
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
        }
    });
});

// ------------------------------------------
// Normal authentication
// ------------------------------------------
app.post('', (req, res) => {
    var body = req.body;

    User.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return responses.internalErrorServer(err, res, 'Error looking for the user');
        }
        if (!userDB) {
            return responses.badRequestAuth('Wrong user info -email', res);
        }
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return responses.badRequestAuth('Wrong user info -password', res);
        }

        // Create token
        userDB.password = ':)';
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 14400 }); // 4 hours
        return res.status(200).json({
            ok: true,
            user: userDB,
            token: token,
            id: userDB.id,
            menu: Menu.getMenu(userDB.role)
        });
    });
});

module.exports = app;