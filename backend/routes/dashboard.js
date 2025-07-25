const express = require('express');
const router = express.Router();

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalJobs: 2500,
      studentsHelped: 15000,
      successStories: 850,
      partneredCompanies: 200,
      todayJobs: 45,
      weeklyApplications: 1200
    }
  });
});

module.exports = router;