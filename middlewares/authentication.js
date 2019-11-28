var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ----------------
// Verify token
// ----------------
exports.verifyToken = function (req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Incorrect token',
                errors: err
            });
        }
        req.user = decoded.user;
        next();
    });
};

exports.verifyAdminRole = function (req, res, next) {
    var user = req.user;
    if (user.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Incorrect token - No admin role',
            errors: { message: 'User not valid - No admin role' }
        });
    }
};

exports.verifyAdminRoleOrSameUser = function (req, res, next) {
    var user = req.user;
    var id = req.params.id;
    if (user._id == id || user.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            message: 'Incorrect token - No are same user or not admin role',
            errors: { message: 'User not valid' }
        });
    }
};

