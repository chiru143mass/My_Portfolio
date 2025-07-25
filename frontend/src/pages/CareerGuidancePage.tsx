import React from 'react';
import { FileText, Users, BookOpen, Award } from 'lucide-react';

const CareerGuidancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Guidance</h1>
          <p className="text-xl text-gray-600">
            Expert tips and resources to accelerate your career journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Resume Building</h3>
            <p className="text-gray-600 mb-4">Create professional resumes that stand out</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Prep</h3>
            <p className="text-gray-600 mb-4">Master the art of interviews with our tips</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Skill Development</h3>
            <p className="text-gray-600 mb-4">Discover in-demand skills and courses</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Certifications</h3>
            <p className="text-gray-600 mb-4">Get certified in trending technologies</p>
            <button className="btn-primary w-full">Learn More</button>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Tips</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Build a Strong Online Presence</h3>
              <p className="text-gray-600">
                Create professional profiles on LinkedIn and GitHub. Showcase your projects and skills.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Network Actively</h3>
              <p className="text-gray-600">
                Attend industry events, join professional groups, and connect with mentors.
              </p>
            </div>
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep Learning</h3>
              <p className="text-gray-600">
                Stay updated with industry trends and continuously develop new skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGuidancePage;