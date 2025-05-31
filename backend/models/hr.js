const mongoose = require('mongoose');

const hrSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const HR = mongoose.model('HR', hrSchema);

module.exports = HR;
