// src/stores/useAuthStore.js
import { defineStore } from 'pinia'
import api from '@/services/apiServices'
import { useActivityStore } from '@/stores/useActivityStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
  }),

  actions: {
    async register({ name, email, password }) {
      try {
        this.loading = true
        const res = await api.post('/api/v1/users/register', {
          name,
          email,
          password,
        })
        const payload = res.data?.data ?? res.data
        return { ok: true, data: payload }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Registrasi gagal. Periksa data Anda dan coba lagi.'
        return { ok: false, message: msg }
      } finally {
        this.loading = false
      }
    },

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

        const activityStore = useActivityStore()
        activityStore.setActiveUser(user?.id ?? null)
        activityStore.addEvent({
          type: 'login',
          title: 'Login berhasil',
          description: `${user?.name || 'Pengguna'} berhasil masuk ke sistem`,
          status: 'success',
          metadata: { email },
        })

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
          const activityStore = useActivityStore()
          activityStore.setActiveUser(this.currentUser?.id ?? null)
        } catch (err) {
          console.warn('Token invalid, logout otomatis')
          this.logout()
        }
      } else {
        const activityStore = useActivityStore()
        activityStore.setActiveUser(null)
      }
    },

    async logout() {
      const lastUser = this.currentUser
      try {
        await api.delete('/api/v1/users/logout')
      } catch {}
      this.currentUser = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')

      if (lastUser) {
        const activityStore = useActivityStore()
        activityStore.setActiveUser(lastUser.id ?? null)
        activityStore.addEvent({
          type: 'login',
          title: 'Logout',
          description: `${lastUser.name || 'Pengguna'} keluar dari sistem`,
          status: 'info',
          metadata: { email: lastUser.email },
        })
        activityStore.setActiveUser(null)
      }
    },
  },
})
