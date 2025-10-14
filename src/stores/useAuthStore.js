// src/stores/useAuthStore.js
import { defineStore } from 'pinia'
import api from '@/services/apiServices'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
  }),

  actions: {
    async login({ email, password }) {
      try {
        this.loading = true
        const res = await api.post('/api/v1/users/login', { email, password })

        const { token, user } = res.data.data

        this.token = token
        this.currentUser = user

        localStorage.setItem('token', token)
        localStorage.setItem('currentUser', JSON.stringify(user))
        this.loading = false

        return { ok: true, user }
      } catch (err) {
        this.loading = false
        const msg =
          err.response?.data?.message ||
          'Login gagal. Periksa email atau password.'
        return { ok: false, message: msg }
      }
    },

    async init() {
      if (this.token) {
        try {
          const res = await api.get('/api/v1/users/me')
          this.currentUser = res.data.data.user
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
        } catch (err) {
          console.warn('Token invalid, logout otomatis')
          this.logout()
        }
      }
    },

    async logout() {
      try {
        await api.delete('/api/v1/users/logout')
      } catch {}
      this.currentUser = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
    },
  },
})
