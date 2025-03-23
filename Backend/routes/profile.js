const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/user');
const Event = require('../models/event');
const multer = require('multer');
const path = require('path');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function(req, file, cb) {
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get current user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Handle nested JSON objects that were sent as strings
    if (updateData.preferences && typeof updateData.preferences === 'string') {
      updateData.preferences = JSON.parse(updateData.preferences);
    }
    if (updateData.socialLinks && typeof updateData.socialLinks === 'string') {
      updateData.socialLinks = JSON.parse(updateData.socialLinks);
    }
    if (updateData.emailNotifications && typeof updateData.emailNotifications === 'string') {
      updateData.emailNotifications = JSON.parse(updateData.emailNotifications);
    }
    
    // Add profile image path if a file was uploaded
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Set profileCompleted to true when updating profile
    updateData.profileCompleted = true;
    
    // Find and update the user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's registered events
router.get('/events', auth, async (req, res) => {
  try {
    // Find user with populated event data
    const user = await User.findById(req.user.id).select('registeredEvents');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user has no registered events, return empty array
    if (!user.registeredEvents || user.registeredEvents.length === 0) {
      return res.json([]);
    }
    
    // Extract event IDs from registeredEvents
    const eventIds = user.registeredEvents.map(reg => reg.eventId);
    
    // Find all events that the user has registered for
    const events = await Event.find({
      _id: { $in: eventIds }
    }).populate('createdBy', 'name email');
    
    // Enhance events with registration date from user object
    const enhancedEvents = events.map(event => {
      const registration = user.registeredEvents.find(
        reg => reg.eventId.toString() === event._id.toString()
      );
      
      return {
        ...event.toObject(),
        registrationDate: registration ? registration.registrationDate : null
      };
    });
    
    res.json(enhancedEvents);
  } catch (err) {
    console.error('Error fetching registered events:', err);
    res.status(500).json({ message: 'Failed to load your registered events', error: err.message });
  }
});

// Get event registrations where user is organizer
router.get('/hosted-events', auth, async (req, res) => {
  try {
    // Find all events where the user is the creator
    const events = await Event.find({ createdBy: req.user.id })
      .select('title date location registeredCount');
    
    res.json(events);
  } catch (err) {
    console.error('Error fetching hosted events:', err);
    res.status(500).json({ message: 'Failed to fetch your hosted events', error: err.message });
  }
});

module.exports = router;
