import { defineStore } from 'pinia';
import axios from 'axios';
import { useUserStore } from './useUserStore';

/**
 * Authentication store integrated with backend API.
 * - login(credentials) -> POST /api/login -> { token, user }
 * - init() -> restore token from localStorage, call /api/me if available
 * - logout() -> clear token + user
 *
 * This is a minimal, replaceable skeleton; adapt endpoints to your API.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
  }),
  actions: {
    async login({ email, password }) {
      try {
        this.loading = true;
        // Replace '/api/login' with your real login endpoint
        const res = await axios.post('/api/login', { email, password });
        const { token, user } = res.data;
        this.token = token;
        this.currentUser = user;
        // persist
        localStorage.setItem('token', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        // attach header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.loading = false;
        return { ok: true, user };
      } catch (err) {
        // If backend is not reachable, fall back to local sample users (dev only)
        this.loading = false;
        const userStore = useUserStore();
        const localUser = userStore.users.find(
          (u) => u.email === email && u.password === password
        );
        if (localUser) {
          // simulate token
          const token = `dev-token-${localUser.id}`;
          this.token = token;
          this.currentUser = {
            id: localUser.id,
            name: localUser.name,
            role: localUser.role,
            email: localUser.email,
          };
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return { ok: true, user: this.currentUser };
        }

        // normalize error
        const message =
          err?.response?.data?.message || err.message || 'Login failed';
        return { ok: false, message };
      }
    },

    logout() {
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      delete axios.defaults.headers.common['Authorization'];
    },

    /**
     * Initialize auth store on app start. If a token exists, attach
     * it and try to fetch the current user from /api/me. If the
     * request fails, fallback to stored `currentUser` (if any).
     */
    async init() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        try {
          const res = await axios.get('/api/me');
          this.currentUser = res.data;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } catch (err) {
          // If backend isn't available, keep the saved currentUser if present.
          const saved = localStorage.getItem('currentUser');
          this.currentUser = saved ? JSON.parse(saved) : null;
        }
      }
    },
  },
});
