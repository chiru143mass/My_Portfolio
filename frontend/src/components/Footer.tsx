import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sun, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Heart 
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="gradient-bg p-2 rounded-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Surya Job Updates</h3>
                <p className="text-sm text-gray-400">Empowering Every Student</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Dedicated to creating equal career opportunities for all students, 
              regardless of gender. Your success is our mission.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">contact@suryajobupdates.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Bangalore, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link to="/jobs" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Browse Jobs
              </Link>
              <Link to="/success-stories" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Success Stories
              </Link>
              <Link to="/guidance" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Career Guidance
              </Link>
              <Link to="/mentorship" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Mentorship
              </Link>
              <Link to="/resources" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Resources
              </Link>
            </div>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-lg font-semibold mb-4">For Students</h4>
            <div className="space-y-2">
              <Link to="/register" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Create Profile
              </Link>
              <Link to="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Student Dashboard
              </Link>
              <Link to="/bookmarks" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Saved Jobs
              </Link>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Resume Builder
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Interview Tips
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Skill Development
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Help Center
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact Us
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                FAQ
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Feedback
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="text-center mb-8">
            <h4 className="text-xl font-semibold mb-2">Stay Updated</h4>
            <p className="text-gray-400 mb-4">
              Get daily job updates and career tips delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-400"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>

          {/* Social Media */}
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              © 2024 Surya Job Updates. All rights reserved.
            </p>
            <p className="flex items-center justify-center">
              Made with <Heart className="h-4 w-4 text-red-500 mx-1" /> for students everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;