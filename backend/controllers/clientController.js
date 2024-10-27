const Client = require('../models/Client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new client
exports.registerClient = async (req, res) => {
    try {
        const { clientName, email, password, projectId } = req.body;
        
        // Check if client already exists
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(409).json({ message: 'Email already in use' });
        }

        const client = new Client({
            clientName,
            email,
            password,
            projectId
        });

        await client.save();
        res.status(201).json({ message: 'Client registered successfully', clientId: client._id });
    } catch (error) {
        res.status(500).json({ message: 'Error registering client', error: error.message });
    }
};

// Client login
exports.loginClient = async (req, res) => {
    try {
        const { email, password } = req.body;
        const client = await Client.findOne({ email });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const isMatch = await bcrypt.compare(password, client.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a token
        const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
// Update client
exports.updateClient = async (req, res) => {
    const { clientId } = req.params;
    const updates = req.body;

    try {
        const client = await Client.findByIdAndUpdate(clientId, updates, { new: true });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client updated successfully', client });
    } catch (error) {
        res.status(500).json({ message: 'Error updating client', error: error.message });
    }
};
// Delete client
exports.deleteClient = async (req, res) => {
    const { clientId } = req.params;

    try {
        const client = await Client.findByIdAndDelete(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting client', error: error.message });
    }
};
