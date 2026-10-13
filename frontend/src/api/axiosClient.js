import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT bearer token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifelink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized & error extraction
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      // Trigger a custom event for AuthContext to pick up
      const currentToken = localStorage.getItem('lifelink_token');
      if (currentToken) {
        localStorage.removeItem('lifelink_token');
        localStorage.removeItem('lifelink_user');
        window.dispatchEvent(new CustomEvent('lifelink_auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
