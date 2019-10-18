// Requires
var express = require('express');
var mongoose = require('mongoose');

// Initialize variables
var app = express();

// Database connection
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, res) => {
    if (error) throw error;
    console.log('Data base: \x1b[32m%s\x1b[0m', 'online');
});

// Routes
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: 'Request successful!'
    });
});

// Listeners
app.listen(3000, () => {
    console.log('Express server port 3000: \x1b[32m%s\x1b[0m', 'online');
});