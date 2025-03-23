const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/event'));
app.use('/api/profiles', require('./routes/profile'));
app.use('/api/blogs', require('./routes/blog'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MongoDB URI provided. Running in development mode with mock data.');
}

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));