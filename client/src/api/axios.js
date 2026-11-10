/**
 * Shared axios instance.
 * - Points at the Vite dev proxy (/api) so no host hard-coding.
 * - Automatically attaches the JWT from localStorage.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stockflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
