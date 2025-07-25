import React from 'react';
import { MapPin, Calendar, DollarSign, Building2, Heart } from 'lucide-react';

const JobDetailsPage: React.FC = () => {
  const job = {
    title: 'Frontend Developer Intern',
    company: 'Tech Innovators',
    location: 'Bangalore',
    type: 'Internship',
    salary: { min: 15000, max: 25000, currency: 'INR' },
    description: 'Join our team as a frontend developer intern and work on exciting projects...',
    requirements: ['Basic React knowledge', 'HTML/CSS skills', 'Good communication'],
    benefits: ['Mentorship', 'Certificate', 'Stipend', 'Free lunch'],
    skills: ['React', 'JavaScript', 'CSS'],
    applicationDeadline: '2024-02-15',
    genderInclusive: true
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center text-primary-600 text-lg font-medium mb-2">
                <Building2 className="h-5 w-5 mr-2" />
                {job.company}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
            </div>
            {job.genderInclusive && (
              <div className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4 inline mr-1" />
                Gender Inclusive
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center text-green-600 font-semibold mb-1">
                <DollarSign className="h-4 w-4 mr-1" />
                ₹{job.salary.min.toLocaleString()} - ₹{job.salary.max.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">per month</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-semibold text-gray-800 mb-1">{job.type}</div>
              <div className="text-sm text-gray-500">Job Type</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center font-semibold text-gray-800 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(job.applicationDeadline).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">Application Deadline</div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h3>
              <ul className="space-y-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary flex-1">
                Apply Now
              </button>
              <button className="btn-secondary">
                Save Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;