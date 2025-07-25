const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Success stories endpoint' });
});

router.get('/featured', (req, res) => {
  res.json({ success: true, message: 'Featured success stories endpoint' });
});

module.exports = router;