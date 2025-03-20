const express = require('express');
const User = require('../models/user');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const { 
      name, phone, bio, location, skills, socialLinks,
      specialty, interests, timezone, education, birthMonth, birthYear
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update basic profile fields
    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.skills = skills || user.skills;
    user.socialLinks = socialLinks || user.socialLinks;
    
    // Update preference fields
    user.specialty = specialty || user.specialty;
    user.interests = interests || user.interests;
    user.timezone = timezone || user.timezone;
    
    // Update education information
    if (education) {
      user.education = {
        ...user.education,
        ...education
      };
    }
    
    // Update birth information
    user.birthMonth = birthMonth || user.birthMonth;
    user.birthYear = birthYear || user.birthYear;
    
    // Mark profile as completed
    user.profileCompleted = true;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.remove();
    res.json({ message: 'User account deleted successfully' });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
