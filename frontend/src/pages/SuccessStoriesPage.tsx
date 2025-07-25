import React from 'react';
import { Star, Award, MapPin } from 'lucide-react';

const SuccessStoriesPage: React.FC = () => {
  const stories = [
    {
      name: 'Priya Sharma',
      company: 'Google',
      position: 'Software Engineer',
      story: 'Through Surya Job Updates, I found my dream job at Google. The platform helped me discover opportunities I never knew existed.',
      location: 'Bangalore'
    },
    {
      name: 'Rahul Kumar',
      company: 'Microsoft',
      position: 'Data Scientist',
      story: 'The mentorship program connected me with industry experts who guided me throughout my job search journey.',
      location: 'Hyderabad'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-xl text-gray-600">
            Real students, real achievements, real inspiration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((story, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {story.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{story.name}</h3>
                <p className="text-primary-600 font-medium">{story.position} at {story.company}</p>
                <div className="flex items-center justify-center text-gray-500 text-sm mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {story.location}
                </div>
              </div>

              <p className="text-gray-600 text-center mb-6 italic">"{story.story}"</p>

              <div className="flex items-center justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessStoriesPage;