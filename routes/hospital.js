/* Hospital routes */

var express = require('express');
var jwt = require('jsonwebtoken');
var mdAuthentication = require('../middlewares/authentication');
var Hospital = require('../models/hospital');
var SEED = require('../config/config').SEED;

var app = express();

// ----------------
// Get hospital
// ----------------
app.get('/', (req, res) => {
    Hospital.find({}, 'name user')
        .exec((err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading hospitals',
                    errors: err
                });
            }
            var token = jwt.sign({
                hospitals: hospitals
            }, SEED, {
                expiresIn: 14400
            });
            res.status(200).json({
                ok: true,
                token: token,
                Hospitals: hospitals
            });
        });
});

// ----------------
// Update hospital
// ----------------
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {
    var hospitalId = req.params.id;
    var body = req.body;

    Hospital.findById(hospitalId, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error occurred finding the hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: 'Hospital by id ' + id + ' was not found',
                errors: {
                    message: 'Do not exist hospital by given ID'
                }
            });
        }
        // There are no errors and the hospital exists in the DB
        hospital.name = body.name;
        hospital.img = body.img;
        hospital.user = body.user;
        hospital.save((err, savedHospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error occurred updating the hospital',
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                message: 'Hospital updated successfully',
                Hospital: savedHospital
            });
        });
    });
});

// ----------------
// Create hospital
// ----------------
app.post('/', mdAuthentication.verifyToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        name: body.name,
        img: body.img,
        user: body.user
    });

    hospital.save((err, savedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error creating hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: savedHospital
        });
    });
});

// ----------------
// Delete hospital
// ----------------
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var hospitalId = req.params.id;
    Hospital.findByIdAndRemove(hospitalId, (err, deletedHospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error deleting hospital.',
                errors: err
            });
        }
        if (!deletedHospital) {
            return res.status(500).json({
                ok: false,
                message: 'Not hospital found by the given ID',
                errors: {
                    message: 'Do not exist hospital by ID: ' + hospitalId
                }
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Hospital deleted',
            Hospital: deletedHospital
        });
    });
});

module.exports = app;