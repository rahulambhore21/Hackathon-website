const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  position: { type: String, required: true },
  prize: { type: String, required: true }
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  img: { type: String, required: true },
  price: { type: Number, required: true },
  registrationDeadline: { type: Date, required: true },
  eligibility: { type: String, required: true },
  registeredCount: { type: Number, default: 0 },
  maxTeamSize: { type: Number, default: 4 },
  prizes: [prizeSchema],
  format: { type: String },
  sponsors: [{ type: String }],
  faqs: [faqSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field pre-save
eventSchema.pre('save', function (next) {
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);