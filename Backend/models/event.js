const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  img: { type: String, required: true },
  price: { type: Number, required: true },
  registrationDeadline: { type: Date, required: true },
  eligibility: { type: String, required: true },
  registeredCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Event', eventSchema);