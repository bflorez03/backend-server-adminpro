/* Update file routes */

var fileUpdate = require('express-fileupload');
var fs = require('fs');
var express = require('express');

var User = require('../models/user');
var Hospital = require('../models/hospital');
var Doctor = require('../models/doctor');

var app = express();

// Allow app to use File-Update
app.use(fileUpdate());

/* This method takes type of collection, element id and image file
and then updates/saves image in the DB */
app.put('/:type/:id', (req, res) => {
    var type = req.params.type;
    var id = req.params.id;

    // Validation of file type
    var validTypes = ['user', 'doctor', 'hospital'];
    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Invalid type',
            errors: { message: 'The valid extension are: ' + validTypes.join(', ') }
        });
    }

    // Validate if there is a loaded file
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'Did not select anything',
            errors: { message: 'You have to select an image' }
        });
    }

    // Get file name
    var file = req.files.image;
    var arrayFileName = file.name.split('.');
    var fileExtension = arrayFileName[arrayFileName.length - 1];

    // Validation of the extension of the loaded file
    var validExtensions = ['png', 'jpg', 'gif', 'jpeg'];
    if (validExtensions.indexOf(fileExtension) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Invalid extension',
            errors: { message: 'The valid extension are: ' + validExtensions.join(', ') }
        });
    }

    // Custom file name
    var newFileName = `${id}-${new Date().getMilliseconds()}.${fileExtension}`;

    // Move file from path to directory
    var path = `./upload/${type}/${newFileName}`;
    uploadByType(path, file, type, id, newFileName, res);
});

// This function identify the collection type and call updated function
function uploadByType(path, file, type, id, newFileName, res) {
    var Collection;
    switch (type) {
        case 'user':
            Collection = User;
            break;

        case 'doctor':
            Collection = Doctor;
            break;

        case 'hospital':
            Collection = Hospital;
            break;

        default:
            Collection = null;
            break;
    }
    if (Collection) {
        return (getAndUpdateImgCollection(Collection, path, file, type, id, newFileName, res));
    }
}

// This function get and update/save image of a collection
function getAndUpdateImgCollection(Collection, path, file, type, id, newFileName, res) {
    Collection.findById(id, (err, element) => {
        if (err) {
            return notElementFundById(err, res, id, type);
        }

        if (element == null) {
            return res.status(400).json({
                ok: false,
                message: `Error, not ${type} found by ID: ` + id,
                errors: err
            });
        }

        var oldPath = `./upload/${type}/` + element.img;
        // If oldPath exits, delete the old img
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }

        element.img = newFileName;
        element.save((err, updatedElement) => {
            if (err) {
                return errorUpdatingElement(err, res, id, type);
            }
            // If there aren't errors, then change password
            // update file path and send back a successful response
            updatedElement.password = ':)';
            file.mv(path, err => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        message: 'Error occurred moving file',
                        errors: err
                    });
                }
            });
            return res.status(200).json({
                ok: true,
                message: `${type} updated successfully`,
                element: updatedElement
            });
        });
    });
}

function notElementFundById(err, res, id, type) {
    return res.status(500).json({
        ok: false,
        message: `Error, not ${type} found by ID: ` + id,
        errors: err
    });
}

function errorUpdatingElement(err, res, id, type) {
    return res.status(400).json({
        ok: false,
        message: `Error updating ${type} by ID: ` + id,
        errors: err
    });
}

module.exports = app;