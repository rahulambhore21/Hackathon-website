const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educationSchema = new mongoose.Schema({
  occupation: { type: String, enum: ['Student', 'Professional / Post Grad'] },
  studentLevel: { type: String, enum: ['College', 'High School', 'Middle School'] },
  school: { type: String },
  graduationMonth: { type: String },
  graduationYear: { type: Number }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  college: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'admin' },
  phone: { type: String },
  bio: { type: String },
  location: { type: String },
  skills: [{ type: String }],
  profileImage: { type: String },
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    website: { type: String }
  },
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  emailNotifications: {
    eventReminders: { type: Boolean, default: true },
    announcements: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  // New preference fields
  specialty: { type: String },
  interests: [{ type: String }],
  timezone: { type: String },
  education: { type: educationSchema },
  birthMonth: { type: String },
  birthYear: { type: Number },
  profileCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Password hashing pre-save hook
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Update the updatedAt field
  if (this.isModified()) {
    this.updatedAt = Date.now();
  }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);