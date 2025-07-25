import React from 'react';
import { BookOpen, Video, FileText, Award, ExternalLink } from 'lucide-react';

const ResourcesPage: React.FC = () => {
  const resources = [
    {
      title: 'Complete Web Development Course',
      type: 'course',
      description: 'Learn HTML, CSS, JavaScript, and React from scratch',
      url: '#',
      free: true,
      category: 'Development'
    },
    {
      title: 'Professional Resume Template',
      type: 'template',
      description: 'ATS-friendly resume template for tech roles',
      url: '#',
      free: true,
      category: 'Career'
    },
    {
      title: 'Interview Preparation Guide',
      type: 'guide',
      description: 'Comprehensive guide for technical interviews',
      url: '#',
      free: true,
      category: 'Interview'
    },
    {
      title: 'Data Science Fundamentals',
      type: 'video',
      description: 'Video series covering basics of data science',
      url: '#',
      free: false,
      category: 'Data Science'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="h-6 w-6" />;
      case 'video': return <Video className="h-6 w-6" />;
      case 'template': return <FileText className="h-6 w-6" />;
      case 'guide': return <Award className="h-6 w-6" />;
      default: return <BookOpen className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Resources</h1>
          <p className="text-xl text-gray-600">
            Free courses, templates, and guides to boost your career
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-3 rounded-full mr-4 text-primary-600">
                  {getIcon(resource.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
                    {resource.free && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        FREE
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-primary-600 font-medium">{resource.category}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{resource.description}</p>

              <a
                href={resource.url}
                className="flex items-center justify-center w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Access Resource
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Development', 'Data Science', 'Design', 'Marketing', 'Career', 'Interview', 'Leadership', 'Business'].map((category) => (
              <button
                key={category}
                className="p-4 bg-gray-50 hover:bg-primary-50 rounded-lg text-center transition-colors"
              >
                <span className="font-medium text-gray-700 hover:text-primary-600">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;