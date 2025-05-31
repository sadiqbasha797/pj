const HR = require('../models/hr');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register HR
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if HR already exists
        const existingHR = await HR.findOne({ email });
        if (existingHR) {
            return res.status(400).json({ message: 'HR already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new HR
        const hr = new HR({
            name,
            email,
            password: hashedPassword
        });

        await hr.save();

        // Generate token
        const token = jwt.sign(
            { id: hr._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'HR registered successfully',
            token,
            hr: {
                id: hr._id,
                name: hr.name,
                email: hr.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering HR', error: error.message });
    }
};

// Login HR
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find HR by email
        const hr = await HR.findOne({ email });
        if (!hr) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, hr.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { id: hr._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            hr: {
                id: hr._id,
                name: hr.name,
                email: hr.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Get HR profile
const getProfile = async (req, res) => {
    try {
        const hr = await HR.findById(req.hr.id).select('-password');
        res.json(hr);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update HR profile
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const updatedHR = await HR.findByIdAndUpdate(
            req.hr.id,
            { name, email },
            { new: true }
        ).select('-password');
        
        res.json({
            message: 'Profile updated successfully',
            hr: updatedHR
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
}; 