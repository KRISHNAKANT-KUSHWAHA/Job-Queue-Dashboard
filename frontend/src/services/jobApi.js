import axios from 'axios';

// Smart API URL resolution:
// 1. Check VITE_API_URL or API_URL
// 2. If running locally on localhost, use local backend (http://localhost:3000)
// 3. Otherwise (on Vercel production), connect directly to the live Render backend
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.API_URL) {
    return import.meta.env.API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  return 'https://job-queue-dashboard-vtov.onrender.com';
};

const API_URL = getBaseUrl();

export const getJobs = (status) => {
  const url =
    status && status !== 'all'
      ? `${API_URL}/jobs?status=${status}`
      : `${API_URL}/jobs`;

  return axios.get(url);
};

export const createJob = (job) => {
  return axios.post(`${API_URL}/jobs`, job);
};

export const updateJobStatus = (id, status) => {
  return axios.patch(`${API_URL}/jobs/${id}/status`, {
    status,
  });
};

export const deleteJob = (id) => {
  return axios.delete(`${API_URL}/jobs/${id}`);
};
