// src/services/apiServices.js
import axios from 'axios';
import router from '@/router';

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const isDev = import.meta.env.DEV;

function resolveBaseURL() {
  if (isDev) {
    // Saat development pakai proxy Vite (/api -> target) agar lolos CORS.
    return '';
  }
  if (rawApiUrl) {
    return rawApiUrl;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '/';
}

const resolvedBaseURL = resolveBaseURL();


// === Konfigurasi dasar ===
const api = axios.create({
  baseURL: resolvedBaseURL || undefined,
  timeout: 10000, // optional (10 detik)
});

// === Interceptor: request ===
// Menyisipkan token otomatis sebelum kirim request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === Interceptor: response ===
// Tangani error global (misalnya token kadaluarsa)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = error.config || {};
    if (status === 401 && !config.skipAuthRedirect) {
      // Token invalid / expired -> logout dan arahkan ke login
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      delete axios.defaults.headers.common.Authorization;

      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
