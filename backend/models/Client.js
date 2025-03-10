const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // For hashing passwords

const clientSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    countryCode: {
        type: String,
        trim: true
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Basic validation for phone number with country code
                return /^\+?[\d\s-]+$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    companyLogo: {
        type: String,
        trim: true
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false  // Set to true if every client must be linked to a project
    }]
});

// Pre-save hook to hash password before saving a client
clientSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
