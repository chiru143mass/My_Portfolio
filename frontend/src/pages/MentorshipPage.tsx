import React from 'react';
import { Users, MessageCircle, Star, Award } from 'lucide-react';

const MentorshipPage: React.FC = () => {
  const mentors = [
    {
      name: 'Dr. Sarah Johnson',
      company: 'Tech Corp',
      position: 'Senior Software Engineer',
      expertise: ['React', 'Node.js', 'Leadership'],
      bio: '10+ years experience in software development and team leadership.',
      rating: 4.9
    },
    {
      name: 'Arun Patel',
      company: 'StartupX',
      position: 'Data Science Manager',
      expertise: ['Python', 'Machine Learning', 'Analytics'],
      bio: 'Passionate about helping students transition into data science careers.',
      rating: 4.8
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentorship Program</h1>
          <p className="text-xl text-gray-600">
            Connect with industry experts who guide your career journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Mentors</h3>
            <p className="text-gray-600">Connect with industry professionals with years of experience</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">1-on-1 Guidance</h3>
            <p className="text-gray-600">Get personalized advice and career guidance</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Development</h3>
            <p className="text-gray-600">Learn industry-relevant skills and best practices</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Featured Mentors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mentors.map((mentor, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-xl">
                      {mentor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{mentor.name}</h3>
                    <p className="text-primary-600 font-medium">{mentor.position}</p>
                    <p className="text-gray-600 text-sm">{mentor.company}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{mentor.rating}</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{mentor.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.map((skill) => (
                    <span key={skill} className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>

                <button className="btn-primary w-full">
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Your Mentorship Journey?</h2>
          <p className="text-gray-600 mb-6">
            Join our mentorship program and get guidance from industry experts
          </p>
          <button className="btn-primary text-lg px-8 py-3">
            Find a Mentor
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorshipPage;