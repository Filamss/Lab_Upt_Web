// src/stores/useAuthStore.js
import { defineStore } from 'pinia'
import api from '@/services/apiServices'
import { useActivityStore } from '@/stores/useActivityStore'

const isString = (value) => typeof value === 'string'

const normalizeString = (value) =>
  isString(value) ? value.trim() : value

const appendIfPresent = (formData, key, value, { trim = true } = {}) => {
  if (value === undefined || value === null) {
    return
  }

  const payload = trim && isString(value) ? value.trim() : value
  if (payload === '' || payload === undefined || payload === null) {
    return
  }

  formData.append(key, payload)
}

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
        const name = normalizeString(payload.name)
        const email = normalizeString(payload.email)
        const phone = normalizeString(
          payload.phone_number ?? payload.phoneNumber ?? payload.phone
        )
        const password = payload.password
        const passwordConfirmation =
          payload.password_confirmation ??
          payload.passwordConfirmation ??
          payload.passwordConfirm ??
          payload.password
        const invitationCode = normalizeString(
          payload.invitation_code ?? payload.invitationCode ?? payload.code
        )
        const employmentId = normalizeString(
          payload.employment_identity_number ??
            payload.employmentIdentityNumber ??
            payload.employmentId
        )

        const formData = new FormData()
        appendIfPresent(formData, 'name', name)
        appendIfPresent(formData, 'email', email)
        appendIfPresent(formData, 'phone_number', phone)
        appendIfPresent(formData, 'password', password, { trim: false })
        appendIfPresent(formData, 'password_confirmation', passwordConfirmation, {
          trim: false,
        })
        appendIfPresent(formData, 'invitation_code', invitationCode)
        appendIfPresent(formData, 'employment_identity_number', employmentId)

        const res = await api.post('/api/v1/users/register', formData, {
          skipAuthRedirect: true,
        })
        const result = res.data?.data ?? res.data
        return { ok: true, data: result, message: res.data?.message }
      } catch (err) {
        const isNetworkError =
          err.code === 'ERR_NETWORK' || (!err.response && err.request)
        const msg =
          (isNetworkError
            ? 'Tidak dapat terhubung ke server. Periksa koneksi atau jalankan API backend.'
            : err.response?.data?.message) ||
          err.message ||
          'Registrasi gagal. Periksa data Anda dan coba lagi.'
        const errors = err.response?.data?.errors || null
        const status =
          err.response?.status ||
          err.response?.data?.code ||
          (isNetworkError ? 'NETWORK_ERROR' : null)
        return { ok: false, message: msg, errors, status, network: isNetworkError }
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      try {
        this.loading = true
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))
        appendIfPresent(formData, 'password', password, { trim: false })

        const res = await api.post('/api/v1/users/login', formData)

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

        return { ok: true, user, message: res.data?.message }
      } catch (err) {
        this.loading = false
        const isNetworkError = err.code === 'ERR_NETWORK' || (!err.response && err.request)
        const msg =
          (isNetworkError
            ? 'Tidak dapat terhubung ke server. Periksa koneksi atau jalankan API backend.'
            : err.response?.data?.message) ||
          err.message ||
          'Login gagal. Periksa email atau password.'
        const errors = err.response?.data?.errors || null
        const status =
          err.response?.status ||
          err.response?.data?.code ||
          (isNetworkError ? 'NETWORK_ERROR' : null)
        return { ok: false, message: msg, errors, status, network: isNetworkError }
      }
    },

    async requestPasswordReset({ email }) {
      try {
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))

        const res = await api.post(
          '/api/v1/codes/user-reset-password',
          formData,
          { skipAuthRedirect: true }
        )
        const payload = res.data ?? {}
        const apiStatus = typeof payload.status === 'string' ? payload.status.toLowerCase() : ''
        const message =
          payload.message ||
          'Kode reset password berhasil dikirim ke email Anda.'
        const statusCode = res.status ?? payload.code ?? null
        const lowerMsg = typeof message === 'string' ? message.toLowerCase() : ''

        if (apiStatus && apiStatus !== 'success') {
          return {
            ok: false,
            message,
            errors: payload.errors ?? null,
            status: statusCode,
            notFound:
              apiStatus === 'error' &&
              (lowerMsg.includes('tidak ditemukan') ||
                lowerMsg.includes('tidak terdaftar') || lowerMsg.includes('belum terdaftar')),
          }
        }

        if (lowerMsg.includes('tidak ditemukan') || lowerMsg.includes('tidak terdaftar') || lowerMsg.includes('belum terdaftar')) {
          return {
            ok: false,
            message,
            errors: payload.errors ?? null,
            status: statusCode,
            notFound: true,
          }
        }

        return { ok: true, message, status: statusCode ?? 200 }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Gagal mengirim kode reset password. Periksa email Anda.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        const lowerMsg = typeof msg === 'string' ? msg.toLowerCase() : ''
        return {
          ok: false,
          message: msg,
          errors,
          status,
          notFound:
            status === 404 ||
            lowerMsg.includes('tidak ditemukan') ||
            lowerMsg.includes('tidak terdaftar') || lowerMsg.includes('belum terdaftar'),
        }
      }
    },

    async resetPassword({
      email,
      code,
      password,
      password_confirmation: passwordConfirmation,
    }) {
      try {
        const formData = new FormData()
        appendIfPresent(formData, 'email', normalizeString(email))
        appendIfPresent(formData, 'code', normalizeString(code))
        appendIfPresent(formData, 'password', password, { trim: false })
        appendIfPresent(formData, 'password_confirmation', passwordConfirmation, {
          trim: false,
        })

        const res = await api.patch('/api/v1/users/reset-password', formData)
        const message =
          res.data?.message || 'Password berhasil direset. Silakan masuk.'
        return { ok: true, message, data: res.data?.data }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          'Reset password gagal. Periksa kembali data yang Anda masukkan.'
        const errors = err.response?.data?.errors || null
        const status = err.response?.status || err.response?.data?.code || null
        return {
          ok: false,
          message: msg,
          errors,
          status,
          notFound: status === 404 || (typeof msg === 'string' && (msg.toLowerCase().includes('tidak ditemukan') || msg.toLowerCase().includes('tidak terdaftar'))),
        }
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
