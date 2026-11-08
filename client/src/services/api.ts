import axios from 'axios';

export const api = axios.create({
  baseURL: '/api'
});

// Attach Authorization header if JWT token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('algions_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 to clear stale auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      // localStorage.removeItem('algions_auth_token');
      // localStorage.removeItem('algions_auth_user');
    }
    return Promise.reject(error);
  }
);
