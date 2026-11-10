/**
 * Shared axios instance.
 * - Points at the Vite dev proxy (/api) so no host hard-coding.
 * - Automatically attaches the JWT from localStorage.
 */

import axios from 'axios';

// In dev, '/api' is proxied by Vite. In production (e.g. Cloudflare Pages),
// set VITE_API_URL to the deployed API origin, e.g. https://stockflow-api.onrender.com
const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stockflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server rejects our token, drop it and bounce to /login.
// Keeps the UI from getting stuck in a "silently signed out" state.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('stockflow_token');
      localStorage.removeItem('stockflow_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export default api;
