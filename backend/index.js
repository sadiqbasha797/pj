require('dotenv').config(); // This should be at the very top
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const developerRoutes = require('./routes/developerRoutes'); // Assuming you have this file set up
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // bodyParser is deprecated, Express has its own now

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
  
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

