var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var doctorSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    img: {
        type: String,
        required: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'hospital',
        required: [true, 'Hospital ID is required']
    },
});

module.exports = mongoose.model('doctor', doctorSchema);