const express = require('express');
const router = express.Router();

router.post('/subscribe', (req, res) => {
  res.json({ success: true, message: 'Newsletter subscription endpoint' });
});

module.exports = router;