const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const HR = require('../models/hr');

const verifyAdminHrToken = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(403).send({ message: 'No token provided.' });
    }

    if (bearerHeader.startsWith('Bearer ')) {
        const token = bearerHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if user is admin
            const admin = await Admin.findById(decoded.id);
            if (admin) {
                req.user = admin;
                req.user.role = 'admin';
                return next();
            }

            // Check if user is HR
            const hr = await HR.findById(decoded.id);
            if (hr) {
                req.user = hr;
                req.user.role = 'hr';
                return next();
            }

            // If neither admin nor HR
            return res.status(403).send({ message: 'Access denied. User must be Admin or HR.' });

        } catch (error) {
            return res.status(401).send({ message: 'Failed to authenticate token.' });
        }
    } else {
        res.status(403).send({ message: 'Bearer token not provided correctly.' });
    }
};

module.exports = verifyAdminHrToken; 