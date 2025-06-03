// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.escuelajs.co/api/v1', // Replace with your API base URL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can modify the request config here (e.g., add auth token)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default api;