const express = require('express');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Mock data for demo
    const jobs = [
      {
        _id: '1',
        title: 'Frontend Developer Intern',
        company: 'Tech Innovators',
        location: 'Bangalore',
        type: 'Internship',
        category: 'Internships',
        education: 'Graduate',
        skills: ['React', 'JavaScript', 'CSS'],
        description: 'Join our team as a frontend developer intern and work on exciting projects...',
        requirements: ['Basic React knowledge', 'HTML/CSS skills', 'Good communication'],
        benefits: ['Mentorship', 'Certificate', 'Stipend', 'Free lunch'],
        applicationDeadline: '2024-02-15',
        applicationUrl: 'https://example.com/apply',
        postedDate: '2024-01-15',
        featured: true,
        genderInclusive: true,
        salary: { min: 15000, max: 25000, currency: 'INR' }
      },
      {
        _id: '2',
        title: 'Data Analyst',
        company: 'DataCorp Solutions',
        location: 'Mumbai',
        type: 'Full-time',
        category: 'Entry-level',
        education: 'Graduate',
        skills: ['Python', 'SQL', 'Excel', 'Tableau'],
        description: 'Seeking a data analyst to join our growing analytics team...',
        requirements: ['Statistics knowledge', 'Python experience', '1-2 years experience preferred'],
        benefits: ['Health insurance', 'Training programs', 'Performance bonus'],
        applicationDeadline: '2024-02-20',
        applicationUrl: 'https://example.com/apply',
        postedDate: '2024-01-16',
        featured: true,
        genderInclusive: true,
        salary: { min: 400000, max: 600000, currency: 'INR' }
      }
    ];

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get single job endpoint'
  });
});

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
router.get('/featured', async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get featured jobs endpoint'
  });
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create job endpoint'
  });
});

module.exports = router;