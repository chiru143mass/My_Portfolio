const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true,
    maxlength: [200, 'Job title cannot be more than 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify job type'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
  },
  category: {
    type: String,
    required: [true, 'Please specify job category'],
    enum: ['Entry-level', 'Internships', 'Graduate-trainee', 'Skill-based', 'Remote']
  },
  education: {
    type: String,
    required: [true, 'Please specify education requirement'],
    enum: ['10th', '12th', 'Graduate', 'Post-graduate', 'Any']
  },
  experience: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 10
    }
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Please add minimum salary']
    },
    max: {
      type: Number,
      required: [true, 'Please add maximum salary']
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  skills: [{
    type: String,
    required: [true, 'Please add at least one skill requirement'],
    trim: true
  }],
  description: {
    type: String,
    required: [true, 'Please add a job description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  requirements: [{
    type: String,
    required: true,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  applicationDeadline: {
    type: Date,
    required: [true, 'Please add application deadline']
  },
  applicationUrl: {
    type: String,
    required: [true, 'Please add application URL'],
    match: [
      /^https?:\/\/.+/,
      'Please add a valid URL'
    ]
  },
  applicationEmail: {
    type: String,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  featured: {
    type: Boolean,
    default: false
  },
  genderInclusive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  companyLogo: {
    type: String // URL to company logo
  },
  tags: [{
    type: String,
    trim: true
  }],
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'pending'
    },
    resume: String, // URL to uploaded resume
    coverLetter: String
  }]
}, {
  timestamps: true
});

// Create index for search
JobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skills: 'text',
  location: 'text'
});

// Indexing for performance
JobSchema.index({ location: 1 });
JobSchema.index({ type: 1 });
JobSchema.index({ category: 1 });
JobSchema.index({ education: 1 });
JobSchema.index({ featured: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ applicationDeadline: 1 });

// Virtual for time remaining to apply
JobSchema.virtual('timeToApply').get(function() {
  const now = new Date();
  const deadline = new Date(this.applicationDeadline);
  const timeDiff = deadline.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return 'Expired';
  }
  
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysDiff === 1) {
    return '1 day left';
  } else if (daysDiff < 7) {
    return `${daysDiff} days left`;
  } else {
    return `${Math.ceil(daysDiff / 7)} weeks left`;
  }
});

// Virtual for application status
JobSchema.virtual('isActive').get(function() {
  return this.status === 'active' && new Date(this.applicationDeadline) > new Date();
});

// Increment views when job is viewed
JobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Add applicant
JobSchema.methods.addApplicant = function(userId, resume = '', coverLetter = '') {
  // Check if user already applied
  const existingApplication = this.applicants.find(
    applicant => applicant.user.toString() === userId.toString()
  );
  
  if (existingApplication) {
    throw new Error('User has already applied for this job');
  }
  
  this.applicants.push({
    user: userId,
    resume,
    coverLetter
  });
  
  this.applications += 1;
  return this.save();
};

// Static method to get featured jobs
JobSchema.statics.getFeaturedJobs = function(limit = 6) {
  return this.find({ featured: true, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('postedBy', 'name');
};

// Static method to get jobs by category
JobSchema.statics.getJobsByCategory = function(category, limit = 10) {
  return this.find({ category, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('postedBy', 'name');
};

// Static method for advanced search
JobSchema.statics.searchJobs = function(filters = {}) {
  const query = { status: 'active' };
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i');
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.education) {
    query.education = filters.education;
  }
  
  if (filters.salaryMin || filters.salaryMax) {
    query['salary.min'] = { $gte: filters.salaryMin || 0 };
    if (filters.salaryMax && filters.salaryMax < 10000000) {
      query['salary.max'] = { $lte: filters.salaryMax };
    }
  }
  
  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills };
  }
  
  return this.find(query)
    .sort({ featured: -1, createdAt: -1 })
    .populate('postedBy', 'name');
};

module.exports = mongoose.model('Job', JobSchema);