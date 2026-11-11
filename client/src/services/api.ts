import axios from 'axios';

// Support custom backend URL via Vite env variable (e.g. for Vercel -> Render deployment)
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;
};

export const api = axios.create({
  baseURL: getApiBaseUrl()
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
