const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Manager = require('../models/Manager');
const Developer = require('../models/Developer');
const ContentCreator = require('../models/contentCreator');
const DigitalMarketingRole = require('../models/digitalMarketingRole');
const Client = require('../models/Client');

const userModels = {
    admin: Admin,
    manager: Manager,
    developer: Developer,
    'content-creator': ContentCreator,
    'digital-marketing': DigitalMarketingRole,
    marketer: DigitalMarketingRole,
    client: Client
};

const getUserModel = (role) => userModels[role];

const messageAuth = async (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(403).send({ message: 'No token provided.' });
    }

    if (bearerHeader.startsWith('Bearer ')) {
        const token = bearerHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { id, role } = decoded;

            const UserModel = getUserModel(role);
            if (!UserModel) {
                return res.status(403).send({ message: 'Invalid user role.' });
            }

            const user = await UserModel.findById(id);

            if (user) {
                req.user = { ...user.toObject(), role };
                next();
            } else {
                return res.status(403).send({ message: 'User not found.' });
            }
        } catch (error) {
            return res.status(401).send({ message: 'Failed to authenticate token.' });
        }
    } else {
        res.status(403).send({ message: 'Bearer token not provided correctly.' });
    }
};

module.exports = messageAuth;