import axios from 'axios';

const API_URL = import.meta.env.API_URL || 'http://localhost:3000';

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
