const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Event = require('../models/event');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET all events
router.get('/', async (req, res) => {
  try {
    const { createdBy, category, search } = req.query;
    let query = {};
    
    // Filter by creator if specified
    if (createdBy) {
      query.createdBy = createdBy;
    }
    
    // Filter by category if specified
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Search by title or description if specified
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    let events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    
    // Return mock data while developing
    if (events.length === 0) {
      // Generate mock events
      events = generateMockEvents(createdBy);
    }
    
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!event) {
      // Return mock event for development
      const mockEvent = generateMockEvent(req.params.id);
      return res.json(mockEvent);
    }
    
    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET registrations for an event
router.get('/:id/registrations', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      // For development, return mock registrations
      const mockRegistrations = generateMockRegistrations(req.params.id);
      return res.json(mockRegistrations);
    }
    
    // Check if user has permission (must be creator or admin)
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    // Get all registered users with their details
    const registeredUsers = await User.find({
      _id: { $in: event.registeredUsers }
    }).select('-password');
    
    // Format the registrations data
    const registrations = registeredUsers.map(user => ({
      id: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college || 'Not specified',
        phone: user.phone || 'Not provided',
        skills: user.skills || []
      },
      registrationDate: user.registeredEvents?.find(e => 
        e.eventId.toString() === req.params.id)?.registrationDate || new Date(),
      teamName: `Team ${user.name.split(' ')[0]}`,
      teamSize: Math.floor(Math.random() * 3) + 1,
      paymentStatus: Math.random() > 0.3 ? 'Paid' : 'Pending',
      notes: ''
    }));
    
    res.json(registrations);
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create new event
router.post('/', auth, upload.single('img'), async (req, res) => {
  try {
    // Parse JSON strings back to objects
    const prizes = req.body.prizes ? JSON.parse(req.body.prizes) : [];
    const sponsors = req.body.sponsors ? JSON.parse(req.body.sponsors) : [];
    const faqs = req.body.faqs ? JSON.parse(req.body.faqs) : [];
    
    // Create new event object
    const newEvent = new Event({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      category: req.body.category,
      price: req.body.price,
      registrationDeadline: req.body.registrationDeadline,
      eligibility: req.body.eligibility,
      maxTeamSize: req.body.maxTeamSize,
      format: req.body.format,
      prizes: prizes,
      sponsors: sponsors,
      faqs: faqs,
      createdBy: req.user.id,
      img: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update event
router.put('/:id', auth, upload.single('img'), async (req, res) => {
  try {
    // Find event
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the creator or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    // Parse JSON strings back to objects
    const prizes = req.body.prizes ? JSON.parse(req.body.prizes) : event.prizes;
    const sponsors = req.body.sponsors ? JSON.parse(req.body.sponsors) : event.sponsors;
    const faqs = req.body.faqs ? JSON.parse(req.body.faqs) : event.faqs;
    
    // Update event fields
    const updatedEvent = {
      title: req.body.title || event.title,
      description: req.body.description || event.description,
      date: req.body.date || event.date,
      time: req.body.time || event.time,
      location: req.body.location || event.location,
      category: req.body.category || event.category,
      price: req.body.price || event.price,
      registrationDeadline: req.body.registrationDeadline || event.registrationDeadline,
      eligibility: req.body.eligibility || event.eligibility,
      maxTeamSize: req.body.maxTeamSize || event.maxTeamSize,
      format: req.body.format || event.format,
      prizes: prizes,
      sponsors: sponsors,
      faqs: faqs
    };
    
    // Update image if provided
    if (req.file) {
      updatedEvent.img = `/uploads/${req.file.filename}`;
    }
    
    // Update the event in the database
    event = await Event.findByIdAndUpdate(
      req.params.id, 
      { $set: updatedEvent },
      { new: true }
    );
    
    res.json(event);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the creator or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if registration deadline has passed
    const deadline = new Date(event.registrationDeadline);
    const now = new Date();
    if (deadline < now) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }
    
    // Check if user is already registered
    if (event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // Add user to registered users
    event.registeredUsers.push(req.user.id);
    event.registeredCount = event.registeredUsers.length;
    await event.save();
    
    // Add event to user's registered events
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        registeredEvents: {
          eventId: event._id,
          registrationDate: new Date()
        }
      }
    });
    
    res.json({ message: 'Successfully registered for the event' });
  } catch (err) {
    console.error('Error registering for event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE unregister from event
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is registered
    if (!event.registeredUsers.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }
    
    // Remove user from registered users
    event.registeredUsers = event.registeredUsers.filter(userId => 
      userId.toString() !== req.user.id
    );
    event.registeredCount = event.registeredUsers.length;
    await event.save();
    
    // Remove event from user's registered events
    await User.findByIdAndUpdate(req.user.id, {
      $pull: {
        registeredEvents: { eventId: event._id }
      }
    });
    
    res.json({ message: 'Successfully unregistered from the event' });
  } catch (err) {
    console.error('Error unregistering from event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE remove a specific user from event (admin/organizer only)
router.delete('/:eventId/registrations/:userId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if current user is the creator or an admin
    if (event.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }
    
    // Check if user is registered
    if (!event.registeredUsers.includes(req.params.userId)) {
      return res.status(400).json({ message: 'User is not registered for this event' });
    }
    
    // Remove user from registered users
    event.registeredUsers = event.registeredUsers.filter(userId => 
      userId.toString() !== req.params.userId
    );
    event.registeredCount = event.registeredUsers.length;
    await event.save();
    
    // Remove event from user's registered events
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: {
        registeredEvents: { eventId: event._id }
      }
    });
    
    res.json({ message: 'User removed from event successfully' });
  } catch (err) {
    console.error('Error removing user from event:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET events by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find events where user is registered
    const user = await User.findById(userId).select('registeredEvents');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user has no registered events, return empty array
    if (!user.registeredEvents || user.registeredEvents.length === 0) {
      return res.json([]);
    }
    
    // Extract event IDs from registeredEvents
    const eventIds = user.registeredEvents.map(reg => reg.eventId);
    
    // Find events that the user has registered for
    let events = await Event.find({
      _id: { $in: eventIds }
    }).populate('createdBy', 'name email');
    
    // Add registration date to each event
    events = events.map(event => {
      const registration = user.registeredEvents.find(
        reg => reg.eventId.toString() === event._id.toString()
      );
      
      return {
        ...event.toObject(),
        registrationDate: registration ? registration.registrationDate : null
      };
    });
    
    // If no events found, return mock data for development
    if (events.length === 0) {
      const mockEvents = generateMockEvents();
      // Add registration dates to mock events
      const enhancedMockEvents = mockEvents.map(event => ({
        ...event,
        registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }));
      return res.json(enhancedMockEvents);
    }
    
    res.json(events);
  } catch (err) {
    console.error('Error fetching user events:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Helper function to generate mock events for development
function generateMockEvents(createdBy) {
  const mockEvents = [
    {
      _id: 'mock1',
      title: 'AI Innovation Hackathon',
      description: 'Join the AI Innovation Hackathon and build cutting-edge AI solutions.',
      img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in future
      time: '09:00 AM',
      location: 'Tech Center, San Francisco',
      category: 'ai',
      price: 0,
      registrationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      eligibility: 'Open to all students and professionals',
      maxTeamSize: 4,
      format: 'A 48-hour hackathon focused on developing AI solutions',
      createdBy: { _id: createdBy || 'user1', name: 'Admin User', email: 'admin@example.com' },
      registeredUsers: ['user2', 'user3', 'user4'],
      registeredCount: 3,
      prizes: [
        { position: '1st Place', prize: '$5000 + AWS Credits' },
        { position: '2nd Place', prize: '$2500 + AWS Credits' },
        { position: '3rd Place', prize: '$1000 + AWS Credits' }
      ],
      sponsors: [
        { name: 'Amazon Web Services', level: 'Gold' },
        { name: 'Google Cloud', level: 'Silver' }
      ],
      faqs: [
        { question: 'What should I bring?', answer: 'Your laptop, charger, and enthusiasm!' },
        { question: 'Is food provided?', answer: 'Yes, meals will be provided for all participants.' }
      ]
    },
    {
      _id: 'mock2',
      title: 'Web3 Blockchain Hackathon',
      description: 'Explore blockchain technology and build decentralized applications.',
      img: 'https://images.unsplash.com/photo-1561489413-985b06da5bee',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days in future
      time: '10:00 AM',
      location: 'Crypto Hub, New York',
      category: 'blockchain',
      price: 25,
      registrationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      eligibility: 'Open to blockchain enthusiasts of all levels',
      maxTeamSize: 5,
      format: 'A 72-hour virtual hackathon',
      createdBy: { _id: createdBy || 'user1', name: 'Admin User', email: 'admin@example.com' },
      registeredUsers: ['user5', 'user6'],
      registeredCount: 2,
      prizes: [
        { position: '1st Place', prize: '$10000 + Blockchain Mentorship' },
        { position: '2nd Place', prize: '$5000' }
      ],
      sponsors: [
        { name: 'Ethereum Foundation', level: 'Platinum' },
        { name: 'Binance', level: 'Gold' }
      ],
      faqs: [
        { question: 'Do I need prior blockchain experience?', answer: 'No, we welcome participants of all experience levels!' },
        { question: 'Is there a code of conduct?', answer: 'Yes, all participants must adhere to our code of conduct.' }
      ]
    },
    {
      _id: 'mock3',
      title: 'Environmental Hackathon',
      description: 'Create solutions for environmental sustainability and climate change.',
      img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in future
      time: '09:30 AM',
      location: 'Green Space, Chicago',
      category: 'environment',
      price: 0,
      registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      eligibility: 'Open to anyone passionate about environmental issues',
      maxTeamSize: 3,
      format: 'A weekend-long event with workshops and hacking sessions',
      createdBy: { _id: createdBy || 'user1', name: 'Admin User', email: 'admin@example.com' },
      registeredUsers: ['user7', 'user8', 'user9', 'user10'],
      registeredCount: 4,
      prizes: [
        { position: '1st Place', prize: '$3000 + Sustainability Partnership' },
        { position: '2nd Place', prize: '$1500' },
        { position: '3rd Place', prize: '$750' }
      ],
      sponsors: [
        { name: 'Greenpeace', level: 'Gold' },
        { name: 'World Wildlife Fund', level: 'Silver' }
      ],
      faqs: [
        { question: 'What kind of projects are expected?', answer: 'Projects focusing on environmental sustainability, conservation, or climate change solutions.' },
        { question: 'Will there be mentors?', answer: 'Yes, environmental experts will be available for mentorship.' }
      ]
    }
  ];
  
  return mockEvents;
}

// Helper function to generate mock event by ID
function generateMockEvent(id) {
  const events = generateMockEvents();
  return events.find(event => event._id === id) || events[0];
}

// Helper function to generate mock registrations
function generateMockRegistrations() {
  const mockRegistrations = [];
  
  for (let i = 0; i < 15; i++) {
    mockRegistrations.push({
      id: `user${i+1}`,
      user: {
        id: `user${i+1}`,
        name: `User ${i+1}`,
        email: `user${i+1}@example.com`,
        college: `University of Example ${i % 3 + 1}`,
        phone: `+1 555-${100 + i}`,
        skills: ['JavaScript', 'React', 'Node.js']
      },
      registrationDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
      teamName: `Team ${String.fromCharCode(65 + i % 26)}`,
      teamSize: (i % 3) + 1,
      paymentStatus: i % 5 === 0 ? 'Pending' : 'Paid',
      notes: ''
    });
  }
  
  return mockRegistrations;
}

module.exports = router;