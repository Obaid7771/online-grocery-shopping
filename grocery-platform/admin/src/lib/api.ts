// src/lib/api.ts
// Axios instance with JWT auth interceptor pointing at NestJS backend
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach Bearer token from cookie on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Unwrap API response and redirect to /login on 401
api.interceptors.response.use(
  (res) => {
    // API wraps responses in { success, statusCode, data }
    // Unwrap to return the actual data directly
    if (res.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data) {
      res.data = res.data.data;
    }
    return res;
  },
  (error) => {
    // Only redirect to login on 401 if not already on login page
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        Cookies.remove('admin_token', { path: '/' });
        Cookies.remove('admin_user', { path: '/' });
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
