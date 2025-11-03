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
const clientRoutes = require('./routes/clientRoutes');
const digitalMarketingRoutes = require('./routes/digitalMarketingRoutes');
const contentCreatorRoutes = require('./routes/contentCreatorRoutes');
const hrRoutes = require('./routes/hrRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const jobRoutes = require('./routes/jobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const offerLetterRoutes = require('./routes/offerLetterRoutes');
const { setupWebSocket } = require('./websocket/wsServer');

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = setupWebSocket(server);


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


// Require the project reminder cron job
require('./utils/projectReminderJob');

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

