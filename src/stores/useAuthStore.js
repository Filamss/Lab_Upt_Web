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
    async register(payload = {}) {
      try {
        this.loading = true
        const body = {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          password_confirmation:
            payload.password_confirmation ??
            payload.passwordConfirmation ??
            payload.passwordConfirm ??
            payload.password,
          phone_number:
            payload.phone_number ?? payload.phoneNumber ?? payload.phone,
          invitation_code:
            payload.invitation_code ?? payload.invitationCode ?? payload.code,
          employment_identity_number:
            payload.employment_identity_number ??
            payload.employmentIdentityNumber ??
            payload.employmentId,
        }
        Object.keys(body).forEach((key) => {
          if (
            body[key] === undefined ||
            body[key] === null ||
            (typeof body[key] === 'string' && body[key].trim() === '')
          ) {
            delete body[key]
          }
        })

        const res = await api.post('/api/v1/users/register', body)
        const payload = res.data?.data ?? res.data
        return { ok: true, data: payload }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          'Registrasi gagal. Periksa data Anda dan coba lagi.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return { ok: false, message: msg, errors, status }
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
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return { ok: false, message: msg, errors, status }
      }
    },

    async requestPasswordReset({ email }) {
      try {
        const res = await api.post('/api/v1/codes/user-reset-password', {
          email,
        })
        const message =
          res.data?.message ||
          'Kode reset password berhasil dikirim ke email Anda.'
        return { ok: true, message }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Gagal mengirim kode reset password. Periksa email Anda.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return { ok: false, message: msg, errors, status }
      }
    },

    async resetPassword({
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    }) {
      try {
        const res = await api.patch('/api/v1/users/reset-password', {
          email,
          code,
          password,
          password_confirmation: passwordConfirmation,
        })
        const message =
          res.data?.message || 'Password berhasil direset. Silakan masuk.'
        return { ok: true, message, data: res.data?.data }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Reset password gagal. Periksa kembali data yang Anda masukkan.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return { ok: false, message: msg, errors, status }
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
