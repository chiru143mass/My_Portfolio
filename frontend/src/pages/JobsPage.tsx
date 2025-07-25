import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  MapPin,
  Filter,
  BookmarkIcon,
  Heart,
  ArrowRight,
  Calendar,
  DollarSign,
  Briefcase,
  GraduationCap,
  Clock,
  Building2
} from 'lucide-react';
import { Job, JobFilters } from '../types';
import { jobsAPI } from '../services/api';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    type: '',
    category: '',
    education: '',
    salaryMin: 0,
    salaryMax: 10000000,
    skills: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());

  const location = useLocation();

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(location.search);
    const newFilters = {
      search: urlParams.get('search') || '',
      location: urlParams.get('location') || '',
      type: urlParams.get('type') || '',
      category: urlParams.get('category') || '',
      education: urlParams.get('education') || '',
      salaryMin: parseInt(urlParams.get('salaryMin') || '0'),
      salaryMax: parseInt(urlParams.get('salaryMax') || '10000000'),
      skills: urlParams.get('skills') ? urlParams.get('skills')!.split(',') : []
    };
    setFilters(newFilters);
    fetchJobs(newFilters);
  }, [location.search]);

  const fetchJobs = async (currentFilters: JobFilters) => {
    try {
      setLoading(true);
      const response = await jobsAPI.getAll(currentFilters);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Mock data for demo
      setJobs([
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
        },
        {
          _id: '3',
          title: 'Digital Marketing Executive',
          company: 'Creative Agency Hub',
          location: 'Delhi',
          type: 'Full-time',
          category: 'Entry-level',
          education: 'Graduate',
          skills: ['Social Media', 'SEO', 'Content Marketing', 'Google Ads'],
          description: 'Looking for a creative digital marketing executive to join our team...',
          requirements: ['Digital marketing knowledge', 'Creative mindset', 'Analytical skills'],
          benefits: ['Flexible hours', 'Creative environment', 'Growth opportunities'],
          applicationDeadline: '2024-02-25',
          applicationUrl: 'https://example.com/apply',
          postedDate: '2024-01-17',
          featured: false,
          genderInclusive: true,
          salary: { min: 300000, max: 500000, currency: 'INR' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (newFilters: JobFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 0 && value !== 10000000) {
        if (Array.isArray(value) && value.length > 0) {
          params.append(key, value.join(','));
        } else if (!Array.isArray(value)) {
          params.append(key, value.toString());
        }
      }
    });
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    fetchJobs(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: JobFilters = {
      search: '',
      location: '',
      type: '',
      category: '',
      education: '',
      salaryMin: 0,
      salaryMax: 10000000,
      skills: []
    };
    setFilters(clearedFilters);
    window.history.pushState({}, '', window.location.pathname);
    fetchJobs(clearedFilters);
  };

  const handleBookmark = async (jobId: string) => {
    try {
      if (bookmarkedJobs.has(jobId)) {
        await jobsAPI.unbookmark(jobId);
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await jobsAPI.bookmark(jobId);
        setBookmarkedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error('Error bookmarking job:', error);
      // For demo, just toggle the bookmark
      setBookmarkedJobs(prev => {
        const newSet = new Set(prev);
        if (newSet.has(jobId)) {
          newSet.delete(jobId);
        } else {
          newSet.add(jobId);
        }
        return newSet;
      });
    }
  };

  const formatSalary = (salary: { min: number; max: number; currency: string }) => {
    if (salary.min >= 100000) {
      return `₹${(salary.min / 100000).toFixed(1)}L - ₹${(salary.max / 100000).toFixed(1)}L`;
    }
    return `₹${salary.min.toLocaleString()} - ₹${salary.max.toLocaleString()}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
          <p className="text-lg text-gray-600">
            Discover {jobs.length} opportunities waiting for talented students like you
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, company, or skills..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && updateURL(filters)}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && updateURL(filters)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
            <button
              onClick={() => updateURL(filters)}
              className="btn-primary px-8"
            >
              Search
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Entry-level">Entry-level</option>
                    <option value="Internships">Internships</option>
                    <option value="Graduate-trainee">Graduate Trainee</option>
                    <option value="Skill-based">Skill-based</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  <select
                    value={filters.education}
                    onChange={(e) => handleFilterChange('education', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Any Education</option>
                    <option value="10th">10th Pass</option>
                    <option value="12th">12th Pass</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post-graduate">Post-graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.salaryMin || ''}
                      onChange={(e) => handleFilterChange('salaryMin', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.salaryMax === 10000000 ? '' : filters.salaryMax}
                      onChange={(e) => handleFilterChange('salaryMax', parseInt(e.target.value) || 10000000)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 mr-4"
                >
                  Clear All
                </button>
                <button
                  onClick={() => updateURL(filters)}
                  className="btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job._id} className="card p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                        {job.featured && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                        {job.genderInclusive && (
                          <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-medium">
                            <Heart className="h-3 w-3 inline mr-1" />
                            Inclusive
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-primary-600 font-medium mb-2">
                        <Building2 className="h-4 w-4 mr-1" />
                        {job.company}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {job.education}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {getTimeAgo(job.postedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {job.salary && (
                        <div className="text-right">
                          <div className="flex items-center text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatSalary(job.salary)}
                          </div>
                          <div className="text-xs text-gray-500">per year</div>
                        </div>
                      )}
                      <button
                        onClick={() => handleBookmark(job._id)}
                        className={`p-2 rounded-full ${
                          bookmarkedJobs.has(job._id)
                            ? 'bg-primary-100 text-primary-600'
                            : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <BookmarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill) => (
                      <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;