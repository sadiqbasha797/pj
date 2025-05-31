require('dotenv').config(); // This should be at the very top
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const developerRoutes = require('./routes/developerRoutes'); // Assuming you have this file set up
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
const PORT = process.env.PORT || 4000;
const messageRoutes = require('./routes/messageRoutes');
const http = require('http');
const WebSocket = require('ws');
const clientRoutes = require('./routes/clientRoutes');
const digitalMarketingRoutes = require('./routes/digitalMarketingRoutes');
const contentCreatorRoutes = require('./routes/contentCreatorRoutes');
const jwt = require('jsonwebtoken');
const hrRoutes = require('./routes/hrRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const jobRoutes = require('./routes/jobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const offerLetterRoutes = require('./routes/offerLetterRoutes');
// Create HTTP server first
const server = http.createServer(app);

// Then create WebSocket server
const wss = new WebSocket.Server({ server });

// Store WebSocket server instance in app for use in controllers
app.set('wss', wss);

// Middleware
app.use(cors());

// Configure body-parser with increased limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Make uploads directory available
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/projectManagement';
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Base Route
app.get('/', (req, res) => {
  res.send('Project Management API is running...');
});

app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/developer', developerRoutes); // Use developer routes
app.use('/api/message', messageRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/digital-marketing', digitalMarketingRoutes);
app.use('/api/content-creator', contentCreatorRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/payslip', payslipRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/offer-letters', offerLetterRoutes);
// WebSocket connection handling
wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection');

    try {
        // Get token from URL parameters
        const url = new URL(req.url, 'ws://localhost');
        const token = url.searchParams.get('token');

        if (!token) {
            ws.close(1008, 'No token provided');
            return;
        }

        // Verify token and set user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        ws.userId = decoded.id;
        ws.isAlive = true;

        // Handle ping-pong to keep connection alive
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        // Handle incoming messages
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                console.log('Received:', data);
                
                // Broadcast message to specific user if needed
                wss.clients.forEach(client => {
                    if (client.userId === data.receiverId && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        // Handle client disconnect
        ws.on('close', () => {
            ws.isAlive = false;
            console.log('Client disconnected');
        });

    } catch (error) {
        ws.close(1008, 'Authentication failed');
    }
});

// Ping all clients every 30 seconds to keep connections alive
const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('close', () => {
    clearInterval(interval);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

