/* Image routes */

var express = require('express');
const path = require('path');
const fs = require('fs');

var app = express();

/* Get and send image from a collection element
if it doesn't exist send back no-img.jpg */
app.get('/:type/:img', (req, res) => {
    var type = req.params.type;
    var img = req.params.img;
    var pathImage = path.resolve(__dirname, `../upload/${type}/${img}`);
    if (fs.existsSync(pathImage)) {
        res.sendFile(pathImage);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }
});

module.exports = app;