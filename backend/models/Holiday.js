const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HolidaySchema = new Schema({
    developer: {
        type: Schema.Types.ObjectId,
        required: true
    },
    developerName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Denied','Withdrawn'],
        default: 'Pending'
    },
    approvedBy: {
        name: String,
        role: {
            type: String,
            enum: ['admin', 'manager']
        },
        approvedDate: Date
    },
    appliedOn: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['Developer', 'DigitalMarketingRole', 'ContentCreator'],
        required: true
    }
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', HolidaySchema);

module.exports = Holiday;
