const express = require('express');
const router = express.Router();

const DEMO_USER = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

if (!DEMO_USER.email || !DEMO_USER.password) {
  throw new Error('ADMIN_EMAIL aur ADMIN_PASSWORD environment variables required hain');
}

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    req.session.user = { email };
    return req.session.save((error) => {
      if (error) return res.status(500).json({ success: false, message: 'Session create nahi ho saki' });
      return res.json({ success: true, email });
    });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

router.get('/me', (req, res) => {
  const loggedIn = Boolean(req.session && req.session.user && req.session.user.email === DEMO_USER.email);
  res.json({ loggedIn, email: loggedIn ? DEMO_USER.email : null });
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