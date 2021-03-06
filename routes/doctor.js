/* Doctor routes */

var express = require('express');
var Doctor = require('../models/doctor');
var mdAuthentication = require('../middlewares/authentication');
var Responses = require('../shared/serviceResponses');

var app = express();
var response = new Responses();

// ----------------
// Get all doctors 
// ----------------
app.get('/', (req, res) => {
    var from = req.query.from || 0;
    from = Number(from);

    Doctor.find({})
        .skip(from)
        .limit(5)
        .populate('hospital')
        .populate('user', 'name email')
        .exec((err, doctors) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error loading doctors from DB',
                    errors: err
                });
            }
            Doctor.count({}, (err, totalDoctors) => {
                res.status(200).json({
                    ok: true,
                    totalDoctors: totalDoctors,
                    message: 'All doctors loaded successfully',
                    doctors: doctors
                });
            });
        });
});

// ----------------
// Get doctor by ID 
// ----------------
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Doctor.findById(id)
        .populate('hospital')
        .populate('user', 'name email img')
        .exec((err, doctor) => {
            if (err) {
                response.internalErrorServer(err, res, 'Error looking for the doctor');
            }
            if (!doctor) {
                response.badRequestAuth('Not doctor found', res);
            }
            response.elementLoaded(doctor, res);
        });
});

// ----------------
// Create doctor 
// ----------------
app.post('/', mdAuthentication.verifyToken, (req, res) => {
    var body = req.body;
    var doctor = new Doctor({
        name: body.name,
        user: req.user._id,
        hospital: body.hospital
    });
    doctor.save((err, savedDoctor) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Error saving new doctor',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            message: 'Doctor saved successfully',
            doctor: savedDoctor
        });
    });
});

// ----------------
// Update doctor 
// ----------------
app.put('/:id', mdAuthentication.verifyToken, (req, res) => {
    var doctorId = req.params.id;
    var body = req.body;
    Doctor.findById(doctorId, (err, doctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error loading doctor by ID: ' + doctorId,
                errors: err
            });
        }
        if (!doctor) {
            return res.status(400).json({
                ok: false,
                message: 'Do not exist doctor by ID: ' + doctorId,
                errors: err
            });
        }
        // If there are no errors, save the data into the doctor
        doctor.name = body.name;
        doctor.user = body.user;
        doctor.hospital = body.hospital;
        // Save updated doctor into the DB
        doctor.save((err, updatedDoctor) => {
            if (err) {
                return res.status(401).json({
                    ok: false,
                    message: 'Error updating doctor by ID: ' + doctorId,
                    errors: err
                });
            }
            res.status(201).json({
                ok: true,
                message: 'Doctor by ID: ' + doctorId + ' updated successfully',
                doctor: updatedDoctor
            });
        });
    });
});

// ----------------
// Delete doctor
// ----------------
app.delete('/:id', mdAuthentication.verifyToken, (req, res) => {
    var doctorId = req.params.id;
    Doctor.findByIdAndRemove(doctorId, (err, deletedDoctor) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error loading doctor by ID: ' + doctorId,
                errors: err
            });
        }
        if (!deletedDoctor) {
            return res.status(400).json({
                ok: false,
                message: 'Do not exist doctor by ID: ' + doctorId,
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            message: 'Doctor deleted successfully',
            doctor: deletedDoctor
        });
    });
});

module.exports = app;