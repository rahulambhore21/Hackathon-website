const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user data from database
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token: User not found' });
    
    // Set user info in request
    req.user = { 
      id: user._id, 
      role: user.role,
      name: user.name,
      email: user.email 
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Invalid token: ' + err.message });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Verify user has access to a resource (either admin or the owner)
const verifyAccess = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;
  
  if (req.user.role === 'admin' || req.user.id.toString() === resourceUserId) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. You don\'t have permission to this resource.' });
  }
};

module.exports = { auth, adminOnly, verifyAccess };