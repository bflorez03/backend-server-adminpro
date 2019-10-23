/* Search routes */

var express = require('express');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');
var User = require('../models/user');

var app = express();


//--------------------------------
// Collection search
//--------------------------------
app.get('/collection/:table/:search', (req, res) => {
    var search = req.params.search;
    var table = req.params.table;
    var regex = new RegExp(search, 'i');
    var promise;

    switch (table) {
        case 'user':
            promise = searchUsers(search, regex);
            break;
        case 'doctor':
            promise = searchDoctors(search, regex);
            break;
        case 'hospital':
            promise = searchHospitals(search, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                message: 'user, doctor or hospital are the only table available for searching',
                errors: {
                    message: 'Name of table invalid'
                }
            });

    }
    promise.then(data => {
        res.status(200).json({
            ok: true,
            [table]: data
        });
    });
});

//--------------------------------
// General search
//--------------------------------
app.get('/all/:search', (req, res, next) => {
    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([
        searchHospitals(search, regex),
        searchDoctors(search, regex),
        searchUsers(search, regex)
    ]).then(answers => {
        res.status(200).json({
            ok: true,
            hospitals: answers[0],
            doctors: answers[1],
            users: answers[2]
        });
    });
});

function searchHospitals(search, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({
                name: regex
            })
            .populate('user', 'name email')
            .exec((err, hospitals) => {
                if (err) {
                    reject('Error loading hospitals', err);
                } else {
                    resolve(hospitals);
                }
            });
    });
}

function searchDoctors(search, regex) {
    return new Promise((resolve, reject) => {
        Doctor.find({
                name: regex
            })
            .populate('user', 'name email')
            .populate('hospital')
            .exec((err, doctors) => {
                if (err) {
                    reject('Error loading doctors', err);
                } else {
                    resolve(doctors);
                }
            });
    });
}

function searchUsers(search, regex) {
    return new Promise((resolve, reject) => {
        User.find({}, 'name surname email role')
            .or([{
                'name': regex
            }, {
                'email': regex
            }])
            .exec((err, users) => {
                if (err) {
                    reject('Error loading users', err);
                } else {
                    resolve(users);
                }
            });
    });
}

module.exports = app;