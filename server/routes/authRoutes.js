const express = require('express');
const passport = require('passport');
const { register, login, googleCallback, logout, status, setRole, updateProfile, deleteAccount } = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const router = express.Router();

// Existing email/password routes
router.post('/register', register);
router.post('/login', login);
router.post('/set-role', isAuthenticated, setRole);
router.patch('/profile', isAuthenticated, updateProfile);
router.delete('/delete', isAuthenticated, deleteAccount);

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
