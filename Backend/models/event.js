const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  eligibility: {
    type: String,
    required: true
  },
  maxTeamSize: {
    type: Number,
    default: 4
  },
  format: {
    type: String
  },
  img: {
    type: String
  },
  prizes: [
    {
      position: String,
      prize: String
    }
  ],
  sponsors: [
    {
      name: String,
      level: {
        type: String,
        enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Partner', 'In-Kind'],
        default: 'Gold'
      },
      website: String,
      logoUrl: String
    }
  ],
  faqs: [
    {
      question: String,
      answer: String
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  registeredCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);