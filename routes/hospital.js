/* Hospital routes */

var express = require('express');
var mdAuthentication = require('../middlewares/authentication');
var Hospital = require('../models/hospital');
var Responses = require('../shared/serviceResponses');

var app = express();
var response = new Responses();

// ----------------
// Get hospitals
// ----------------
app.get('/', (req, res) => {
    var from = req.query.from || 0;
    from = Number(from);

    Hospital.find({}, 'name user')
        .skip(from)
        .populate('user', 'name email')
        .exec((err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading hospitals',
                    errors: err
                });
            }
            Hospital.count({}, (err, totalHospitals) => {
                res.status(200).json({
                    ok: true,
                    totalHospitals: totalHospitals,
                    Hospitals: hospitals
                });
            });
        });
});

// ----------------
// Get hospital by ID
// ----------------
app.get('/:id', (req, res) => {
    var id = req.params.id;

    Hospital.findById(id)
        .populate('user', 'name img email')
        .exec((err, hospital) => {
            if (err) {
                response.internalErrorServer(err, res, 'Error looking for the hospital');
            }
            if (!hospital) {
                response.badRequestAuth('Not hospital fount', res);
            }
            response.elementLoaded(hospital, res);
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