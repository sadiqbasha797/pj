const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
    paidTo: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'paidTo.model'
        },
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ['developer', 'digital-marketing', 'content-creator']
        },
        model: {
            type: String,
            required: true,
            enum: ['Developer', 'DigitalMarketingRole', 'ContentCreator']
        }
    },
    amount: {
        type: Number,
        required: true
    },
    paidDate: {
        type: Date,
        required: true
    },
    description: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HR',
        required: true
    }
}, {
    timestamps: true
});

const Payslip = mongoose.model('Payslip', payslipSchema);

module.exports = Payslip; 