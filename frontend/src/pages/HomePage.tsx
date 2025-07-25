import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Users,
  Briefcase,
  TrendingUp,
  Star,
  ArrowRight,
  BookOpen,
  Award,
  Target,
  Heart,
  Zap,
  Globe
} from 'lucide-react';
import { Job, DashboardStats, SuccessStory } from '../types';
import { jobsAPI, dashboardAPI, successStoriesAPI } from '../services/api';

const HomePage: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    studentsHelped: 0,
    successStories: 0,
    partneredCompanies: 0,
    todayJobs: 0,
    weeklyApplications: 0
  });
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, statsRes, storiesRes] = await Promise.all([
          jobsAPI.getFeatured(),
          dashboardAPI.getStats(),
          successStoriesAPI.getFeatured()
        ]);

        setFeaturedJobs(jobsRes.data.slice(0, 6));
        setStats(statsRes.data);
        setSuccessStories(storiesRes.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        // Set mock data for demo
        setFeaturedJobs([
          {
            _id: '1',
            title: 'Frontend Developer Intern',
            company: 'Tech Innovators',
            location: 'Bangalore',
            type: 'Internship',
            category: 'Internships',
            education: 'Graduate',
            skills: ['React', 'JavaScript', 'CSS'],
            description: 'Join our team as a frontend developer intern...',
            requirements: ['Basic React knowledge', 'HTML/CSS skills'],
            benefits: ['Mentorship', 'Certificate', 'Stipend'],
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
            skills: ['Python', 'SQL', 'Excel'],
            description: 'Seeking a data analyst to join our growing team...',
            requirements: ['Statistics knowledge', 'Python experience'],
            benefits: ['Health insurance', 'Training programs'],
            applicationDeadline: '2024-02-20',
            applicationUrl: 'https://example.com/apply',
            postedDate: '2024-01-16',
            featured: true,
            genderInclusive: true,
            salary: { min: 400000, max: 600000, currency: 'INR' }
          }
        ]);

        setStats({
          totalJobs: 2500,
          studentsHelped: 15000,
          successStories: 850,
          partneredCompanies: 200,
          todayJobs: 45,
          weeklyApplications: 1200
        });

        setSuccessStories([
          {
            _id: '1',
            name: 'Priya Sharma',
            photo: '',
            company: 'Google',
            position: 'Software Engineer',
            story: 'Through Surya Job Updates, I found my dream job at Google...',
            achievement: 'First job at Google',
            location: 'Bangalore',
            featured: true
          }
        ]);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    window.location.href = `/jobs?${params.toString()}`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Gateway to
            <span className="block text-accent-300">Dream Careers</span>
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Empowering every student, regardless of gender, to find meaningful career opportunities. 
            Join thousands who've transformed their futures with Surya Job Updates.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location (e.g., Bangalore, Mumbai)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Search Jobs
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.totalJobs.toLocaleString()}+</div>
              <div className="text-blue-200">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.studentsHelped.toLocaleString()}+</div>
              <div className="text-blue-200">Students Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.successStories}+</div>
              <div className="text-blue-200">Success Stories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stats.partneredCompanies}+</div>
              <div className="text-blue-200">Partner Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Today's Featured Opportunities
            </h2>
            <p className="text-xl text-gray-600">
              Fresh job openings posted today - don't miss out!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredJobs.map((job) => (
              <div key={job._id} className="card p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-primary-600 font-medium mb-1">{job.company}</p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                  </div>
                  {job.genderInclusive && (
                    <div className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-medium">
                      <Heart className="h-3 w-3 inline mr-1" />
                      Inclusive
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      {job.type}
                    </span>
                    {job.salary && (
                      <div className="text-sm text-gray-600 mt-1">
                        ₹{job.salary.min.toLocaleString()} - ₹{job.salary.max.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/jobs" className="btn-primary text-lg px-8 py-3">
              Explore All Jobs
              <ArrowRight className="h-5 w-5 ml-2 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Students Choose Surya Job Updates
            </h2>
            <p className="text-xl text-gray-600">
              Your success is our mission. We're committed to creating equal opportunities for all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Daily Fresh Opportunities</h3>
              <p className="text-gray-600">
                New job postings every day from top companies across industries.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gender-Inclusive Focus</h3>
              <p className="text-gray-600">
                Promoting equal opportunities and celebrating diversity in the workplace.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Guidance</h3>
              <p className="text-gray-600">
                Comprehensive resources for resume building, interview prep, and skill development.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mentorship Program</h3>
              <p className="text-gray-600">
                Connect with industry professionals for guidance and career advice.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Get personalized job recommendations based on your skills and preferences.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nationwide Reach</h3>
              <p className="text-gray-600">
                Access opportunities from metros to tier-2 cities across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories That Inspire
            </h2>
            <p className="text-xl text-gray-600">
              Real students, real achievements, real impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div key={story._id} className="card p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {story.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{story.name}</h3>
                <p className="text-primary-600 font-medium mb-2">{story.position} at {story.company}</p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.story}</p>
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/success-stories" className="btn-secondary">
              Read More Success Stories
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 gradient-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have found their dream jobs through our platform.
            Your success story begins here!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
              Create Your Profile
            </Link>
            <Link to="/jobs" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
              Browse Jobs Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;