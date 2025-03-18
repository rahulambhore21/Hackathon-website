const express = require('express');
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Event (Admin Only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

  const { title, description, date, time, location, category, img, price, registrationDeadline, eligibility } = req.body;
  const event = new Event({ title, description, date, time, location, category, img, price, registrationDeadline, eligibility, createdBy: req.user.id });
  await event.save();
  res.status(201).json(event);
});

// Get All Events
router.get('/', async (req, res) => {
  const events = await Event.find().populate('createdBy', 'email');
  res.json(events);
});

// Get Single Event by ID
router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id).populate('createdBy', 'email');
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

// Register for Event
router.post('/:id/register', auth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (event.registeredUsers.includes(req.user.id)) {
    return res.status(400).json({ message: 'User already registered for this event' });
  }

  event.registeredUsers.push(req.user.id);
  event.registeredCount += 1;
  await event.save();
  res.json(event);
});

module.exports = router;