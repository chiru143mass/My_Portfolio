import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { usersAPI } from './services/api';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailsPage from './pages/JobDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import CareerGuidancePage from './pages/CareerGuidancePage';
import MentorshipPage from './pages/MentorshipPage';
import ResourcesPage from './pages/ResourcesPage';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await usersAPI.getProfile();
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header user={user} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/success-stories" element={<SuccessStoriesPage />} />
            <Route path="/guidance" element={<CareerGuidancePage />} />
            <Route path="/mentorship" element={<MentorshipPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                user ? <Navigate to="/dashboard" /> : <RegisterPage onLogin={handleLogin} />
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                user ? <DashboardPage user={user} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                user ? <ProfilePage user={user} setUser={setUser} /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/bookmarks" 
              element={
                user ? <JobsPage /> : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/settings" 
              element={
                user ? <ProfilePage user={user} setUser={setUser} /> : <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;