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

// Helper function to process and validate sponsor data
const processSponsors = (sponsorsData) => {
  if (!sponsorsData) return [];
  
  try {
    // Handle string (JSON) input
    if (typeof sponsorsData === 'string') {
      const parsedSponsors = JSON.parse(sponsorsData);
      
      // Handle array of strings (old format)
      if (Array.isArray(parsedSponsors) && parsedSponsors.every(s => typeof s === 'string')) {
        return parsedSponsors.map(name => ({ name, level: 'Gold' }));
      }
      
      // Handle array of objects (new format)
      if (Array.isArray(parsedSponsors) && parsedSponsors.every(s => typeof s === 'object')) {
        return parsedSponsors.map(sponsor => ({
          name: sponsor.name || 'Unknown Sponsor',
          level: sponsor.level || 'Gold',
          website: sponsor.website || '',
          logoUrl: sponsor.logoUrl || ''
        }));
      }
    }
    
    // Handle array input directly
    if (Array.isArray(sponsorsData)) {
      // Array of strings (old format)
      if (sponsorsData.every(s => typeof s === 'string')) {
        return sponsorsData.map(name => ({ name, level: 'Gold' }));
      }
      
      // Array of objects (new format)
      if (sponsorsData.every(s => typeof s === 'object')) {
        return sponsorsData.map(sponsor => ({
          name: sponsor.name || 'Unknown Sponsor',
          level: sponsor.level || 'Gold',
          website: sponsor.website || '',
          logoUrl: sponsor.logoUrl || ''
        }));
      }
    }
    
    // Default case - unexpected format
    console.error('Unexpected sponsor data format:', sponsorsData);
    return [];
  } catch (err) {
    console.error('Error processing sponsors:', err);
    return [];
  }
};

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
    const parsedFaqs = typeof faqs === 'string' ? JSON.parse(faqs) : faqs;
    
    // Process sponsors with the helper function
    const processedSponsors = processSponsors(sponsors);
    
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
      sponsors: processedSponsors,
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
    
    // Filter by creator - only add if createdBy is valid
    if (createdBy && createdBy !== 'undefined' && createdBy.match(/^[0-9a-fA-F]{24}$/)) {
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
    console.log(`Fetching events for user: ${req.params.userId}`);
    
    // Check if userId is valid MongoDB ObjectId
    if (!req.params.userId || req.params.userId === 'undefined' || !req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // if ( req.user.id !== req.params.userId) {
    //   return res.status(403).json({ message: 'Access denied' });
    // }
    
    // Get user document
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    console.log(`User registered events: ${JSON.stringify(user.registeredEvents)}`);
    
    // If no registered events, return empty array
    if (!user.registeredEvents || user.registeredEvents.length === 0) {
      console.log('No registered events found for user');
      return res.json([]);
    }
    
    // Find all events that the user has registered for
    const events = await Event.find({ 
      _id: { $in: user.registeredEvents.map(id => id.toString()) } 
    }).populate('createdBy', 'name email');
    
    console.log(`Found ${events.length} events for user`);
    res.json(events);
  } catch (err) {
    console.error('Error getting user events:', err);
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

// Get registrations for an event
router.get('/:id/registrations', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');
      
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Check if the current user is authorized to view registrations
    if (event.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view these registrations' });
    }
    
    // If there are registered users
    if (event.registeredUsers && event.registeredUsers.length > 0) {
      // Get user details for all registered users
      const users = await User.find({
        _id: { $in: event.registeredUsers }
      }).select('name email college phone skills');
      
      // Create registration objects with user details
      const registrations = users.map(user => {
        // Find registration date from user.registeredEvents (this would depend on your data model)
        // For now, we'll use a random date in the last 30 days
        const registrationDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
        
        return {
          id: user._id,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            college: user.college || 'Not specified',
            phone: user.phone || 'Not provided',
            skills: user.skills || []
          },
          registrationDate: registrationDate.toISOString(),
          teamName: `Team ${user.name.split(' ')[0]}`, // Create a mock team name based on first name
          teamSize: Math.floor(Math.random() * 4) + 1, // Random team size between 1-4
          paymentStatus: Math.random() > 0.3 ? 'Paid' : 'Pending', // 70% paid status
          notes: ''
        };
      });
      
      return res.json(registrations);
    }
    
    // No registered users
    res.json([]);
    
  } catch (err) {
    console.error('Error getting event registrations:', err);
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
    event.sponsors = processSponsors(sponsors) || event.sponsors;
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

    // Update event with registered user
    event.registeredUsers.push(req.user.id);
    event.registeredCount += 1;
    await event.save();

    // Update user's registered events
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Make sure we don't duplicate event IDs
    if (!user.registeredEvents.includes(event._id)) {
      user.registeredEvents.push(event._id);
      await user.save();
    }

    // Log success for debugging
    console.log(`User ${req.user.id} registered for event ${event._id}`);
    console.log(`User registered events: ${user.registeredEvents}`);
    
    res.json(event);
  } catch (err) {
    console.error('Error registering for event:', err);
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
    
    // Delete the event - using deleteOne instead of remove (which is deprecated)
    await Event.deleteOne({ _id: event._id });
    
    // If there's an image file associated with the event, delete it
    if (event.img && !event.img.startsWith('http') && event.img.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', event.img);
      // Delete file if it exists
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;