const express = require('express');
const passport = require('passport');
const { register, login, googleCallback, logout, status } = require('../controllers/authController');
const router = express.Router();

// Existing email/password routes
router.post('/register', register);
router.post('/login', login);

// Google SSO routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login.html?error=auth_failed', // Redirect on failure
  }),
  googleCallback // Handle success case
);

// Logout and status routes
router.post('/logout', logout);
router.get('/status', status);


module.exports = router;
