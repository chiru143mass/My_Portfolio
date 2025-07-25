export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  category: 'Entry-level' | 'Internships' | 'Graduate-trainee' | 'Skill-based' | 'Remote';
  education: '10th' | '12th' | 'Graduate' | 'Post-graduate' | 'Any';
  skills: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline: string;
  applicationUrl: string;
  postedDate: string;
  featured: boolean;
  genderInclusive: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  education: string;
  skills: string[];
  preferences: {
    jobTypes: string[];
    locations: string[];
    salaryRange: {
      min: number;
      max: number;
    };
  };
  bookmarkedJobs: string[];
  appliedJobs: string[];
  profileComplete: boolean;
  createdAt: string;
}

export interface SuccessStory {
  _id: string;
  name: string;
  photo?: string;
  company: string;
  position: string;
  story: string;
  achievement: string;
  location: string;
  featured: boolean;
}

export interface Mentor {
  _id: string;
  name: string;
  photo?: string;
  company: string;
  position: string;
  expertise: string[];
  bio: string;
  linkedIn?: string;
  available: boolean;
}

export interface Resource {
  _id: string;
  title: string;
  type: 'course' | 'template' | 'guide' | 'video';
  description: string;
  url: string;
  category: string;
  free: boolean;
  featured: boolean;
}

export interface JobFilters {
  search: string;
  location: string;
  type: string;
  category: string;
  education: string;
  salaryMin: number;
  salaryMax: number;
  skills: string[];
}

export interface DashboardStats {
  totalJobs: number;
  studentsHelped: number;
  successStories: number;
  partneredCompanies: number;
  todayJobs: number;
  weeklyApplications: number;
}