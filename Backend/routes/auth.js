const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { name, email,phone, college, password, role } = req.body;
  try {
    console.log('Registering user', { name,phone, email, college, role });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Default to 'user' role unless explicitly set to 'admin'
    const userRole = role === 'admin' ? 'admin' : 'user';

    user = new User({ 
      name, 
      email, 
      phone,
      college, 
      password,
      role: userRole
    });
    
    await user.save();

    const token = jwt.sign({ 
      id: user._id, 
      role: user.role,
      name: user.name
    }, process.env.JWT_SECRET, { expiresIn: '90h' });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Error during registration', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Logging in user', { email });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ 
      id: user._id, 
      name: user.name, 
      role: user.role 
    }, process.env.JWT_SECRET, { expiresIn: '90h' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Error during login', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Error getting current user', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error changing password', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot password - request reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // In a real app, you would send an email with the reset link
    console.log('Password reset token for', email, ':', resetToken);
    
    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (err) {
    console.error('Error in forgot password', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;