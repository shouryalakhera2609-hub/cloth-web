const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Hardcoded user for demo
const DEMO_USER = {
  email: 'shouryalakhera2609@gmail.com',
  password: '123456@',
};

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    // Simple session (JWT recommended for production)
    req.session.user = { email };
    return res.json({ success: true, email });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Auth middleware
function requireLogin(req, res, next) {
  if (req.session && req.session.user && req.session.user.email === DEMO_USER.email) {
    return next();
  }
  return res.status(401).json({ message: 'Login required' });
}

module.exports = { router, requireLogin };