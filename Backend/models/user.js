const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  college: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String
  },
  location: {
    type: String
  },
  skills: [String],
  profileImage: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  socialLinks: {
    linkedin: String,
    github: String,
    website: String
  },
  preferences: {
    specialty: String,
    interests: [String],
    timezone: String
  },
  emailNotifications: {
    eventReminders: {
      type: Boolean,
      default: true
    },
    announcements: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  registeredEvents: [
    {
      eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      },
      registrationDate: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);