const jwt = require('jsonwebtoken');
const HR = require('../models/hr');

const verifyHrToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    return res.status(403).send({ message: 'No token provided.' });
  }

  if (bearerHeader.startsWith('Bearer ')) {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Failed to authenticate token.' });
      } else {
        // Check if the user is an HR
        const hr = await HR.findById(decoded.id);
        if (!hr) {
          return res.status(403).send({ message: 'Access denied.' });
        }
        req.hr = hr; // Add hr to request if needed
        next();
      }
    });
  } else {
    res.status(403).send({ message: 'Bearer token not provided correctly.' });
  }
};

module.exports = verifyHrToken; 