const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/events';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  } 
});

// Create Event (Admin Only)
router.post('/', auth, adminOnly, upload.single('img'), async (req, res) => {
  try {
    const { 
      title, description, date, time, location, category, 
      price, registrationDeadline, eligibility, maxTeamSize, 
      format, prizes, sponsors, faqs 
    } = req.body;

    // Parse JSON strings if they're passed as strings
    const parsedPrizes = typeof prizes === 'string' ? JSON.parse(prizes) : prizes;
    const parsedSponsors = typeof sponsors === 'string' ? JSON.parse(sponsors) : sponsors;
    const parsedFaqs = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;
    
    const event = new Event({ 
      title, 
      description, 
      date, 
      time, 
      location, 
      category, 
      price: Number(price), 
      registrationDeadline, 
      eligibility,
      maxTeamSize: Number(maxTeamSize) || 4,
      format,
      prizes: parsedPrizes,
      sponsors: parsedSponsors,
      faqs: parsedFaqs,
      createdBy: req.user.id,
      img: req.file ? `/uploads/events/${req.file.filename}` : ''
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// Get All Events with filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, upcoming, sort, createdBy } = req.query;
    
    // Build query
    let query = {};
    
    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Only upcoming events (date >= today)
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }
    
    // Filter by creator
    if (createdBy) {
      query.createdBy = createdBy;
    }
    
    // Build sort options
    let sortOption = {};
    if (sort === 'date-asc') sortOption.date = 1;
    else if (sort === 'date-desc') sortOption.date = -1;
    else if (sort === 'price-asc') sortOption.price = 1;
    else if (sort === 'price-desc') sortOption.price = -1;
    else if (sort === 'popularity') sortOption.registeredCount = -1;
    else sortOption.date = 1; // Default sort
    
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOption);
      
    res.json(events);
  } catch (err) {
    console.error('Error getting events', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Events by User
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get events registered by the user
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const events = await Event.find({ _id: { $in: user.registeredEvents } })
      .populate('createdBy', 'name email');
      
    res.json(events);
  } catch (err) {
    console.error('Error getting user events', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');
      
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('Error getting event', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Event (Admin Only)
router.put('/:id', auth, adminOnly, upload.single('img'), async (req, res) => {
  try {
    const { 
      title, description, date, time, location, category, 
      price, registrationDeadline, eligibility, maxTeamSize, 
      format, prizes, sponsors, faqs 
    } = req.body;
    
    // Parse JSON strings if they're passed as strings
    const parsedPrizes = typeof prizes === 'string' ? JSON.parse(prizes) : prizes;
    const parsedSponsors = typeof sponsors === 'string' ? JSON.parse(sponsors) : sponsors;
    const parsedFaqs = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Update fields
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.category = category || event.category;
    event.price = price ? Number(price) : event.price;
    event.registrationDeadline = registrationDeadline || event.registrationDeadline;
    event.eligibility = eligibility || event.eligibility;
    event.maxTeamSize = maxTeamSize ? Number(maxTeamSize) : event.maxTeamSize;
    event.format = format || event.format;
    event.prizes = parsedPrizes || event.prizes;
    event.sponsors = parsedSponsors || event.sponsors;
    event.faqs = parsedFaqs || event.faqs;
    
    // Update image if a new one is uploaded
    if (req.file) {
      event.img = `/uploads/events/${req.file.filename}`;
    }
    
    await event.save();
    res.json(event);
  } catch (err) {
    console.error('Error updating event', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for Event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if registration deadline has passed
    if (new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Check if user is already registered
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    // Update event
    event.registeredUsers.push(req.user.id);
    event.registeredCount += 1;
    await event.save();

    // Update user's registered events
    await User.findByIdAndUpdate(req.user.id, {
      $push: { registeredEvents: event._id }
    });

    res.json(event);
  } catch (err) {
    console.error('Error registering for event', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Event (Admin Only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Remove the event from registered users
    await User.updateMany(
      { registeredEvents: event._id },
      { $pull: { registeredEvents: event._id } }
    );
    
    // Delete the event
    await event.remove();
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;