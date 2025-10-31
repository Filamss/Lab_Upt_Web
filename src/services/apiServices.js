// src/services/apiServices.js
import axios from 'axios';
import router from '@/router';

const baseURL = import.meta.env.VITE_API_URL;
console.log('API Base URL:', baseURL);

// === Konfigurasi dasar ===
const api = axios.create({
  baseURL: '', // gunakan proxy dari vite.config.js
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
