import axios from 'axios';
import { Job, User, SuccessStory, Mentor, Resource, DashboardStats } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Jobs API
export const jobsAPI = {
  getAll: (filters?: any) => api.get('/jobs', { params: filters }),
  getById: (id: string) => api.get(`/jobs/${id}`),
  getFeatured: () => api.get('/jobs/featured'),
  getByCategory: (category: string) => api.get(`/jobs/category/${category}`),
  create: (job: Partial<Job>) => api.post('/jobs', job),
  update: (id: string, job: Partial<Job>) => api.put(`/jobs/${id}`, job),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  bookmark: (jobId: string) => api.post(`/jobs/${jobId}/bookmark`),
  unbookmark: (jobId: string) => api.delete(`/jobs/${jobId}/bookmark`),
  apply: (jobId: string) => api.post(`/jobs/${jobId}/apply`),
};

// Users API
export const usersAPI = {
  register: (userData: Partial<User>) => api.post('/users/register', userData),
  login: (email: string, password: string) => api.post('/users/login', { email, password }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData: Partial<User>) => api.put('/users/profile', userData),
  getBookmarks: () => api.get('/users/bookmarks'),
  getApplications: () => api.get('/users/applications'),
  updatePreferences: (preferences: any) => api.put('/users/preferences', preferences),
};

// Success Stories API
export const successStoriesAPI = {
  getAll: () => api.get('/success-stories'),
  getFeatured: () => api.get('/success-stories/featured'),
  getById: (id: string) => api.get(`/success-stories/${id}`),
  create: (story: Partial<SuccessStory>) => api.post('/success-stories', story),
};

// Mentors API
export const mentorsAPI = {
  getAll: () => api.get('/mentors'),
  getAvailable: () => api.get('/mentors/available'),
  getById: (id: string) => api.get(`/mentors/${id}`),
  requestMentorship: (mentorId: string, message: string) => 
    api.post(`/mentors/${mentorId}/request`, { message }),
};

// Resources API
export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  getFeatured: () => api.get('/resources/featured'),
  getByCategory: (category: string) => api.get(`/resources/category/${category}`),
  getFree: () => api.get('/resources/free'),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentJobs: () => api.get('/dashboard/recent-jobs'),
  getRecommendations: () => api.get('/dashboard/recommendations'),
};

// Newsletter API
export const newsletterAPI = {
  subscribe: (email: string) => api.post('/newsletter/subscribe', { email }),
  unsubscribe: (email: string) => api.post('/newsletter/unsubscribe', { email }),
};

export default api;