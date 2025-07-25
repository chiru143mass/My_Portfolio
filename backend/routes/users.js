const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile update endpoint'
  });
});

module.exports = router;