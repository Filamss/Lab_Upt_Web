import { defineStore } from 'pinia'
import api from '@/services/apiServices'
import { nanoid } from 'nanoid' // buat id dummy unik

export const useTestStore = defineStore('test', {
  state: () => ({
    tests: [],
    machines: [],
    methods: [],
    loading: false,
    error: null,
  }),

  getters: {
    getTestById: (state) => (id) => state.tests.find((t) => t.id === id),
  },

  actions: {
    // === Ambil semua data dari backend (fallback dummy jika gagal) ===
    async fetchAll() {
      try {
        this.loading = true
        const [testsRes, machinesRes, methodsRes] = await Promise.all([
          api.get('/api/v1/tests'),
          api.get('/api/v1/machines'),
          api.get('/api/v1/methods'),
        ])

        this.tests = testsRes.data.data || []
        this.machines = machinesRes.data.data || []
        this.methods = methodsRes.data.data || []
        this.error = null
      } catch (err) {
        console.warn('⚠️ Backend belum tersedia, pakai dummy data sementara.')
        this.error = 'Dummy mode aktif (API belum terhubung).'

        // === Dummy data lokal ===
        this.tests = [
          {
            id: nanoid(),
            serviceCategory: 'Pengujian',
            code: 'UTK',
            testCategory: 'Uji Tarik',
            unit: 'Sample',
            price: 150000,
            method: 'ASTM E8',
            equipment: 'Universal Testing Machine',
          },
          {
            id: nanoid(),
            serviceCategory: 'Machining',
            code: 'CNC',
            testCategory: 'Pemotongan CNC',
            unit: 'Jam',
            price: 200000,
            method: 'Internal SOP 2022',
            equipment: 'CNC Lathe Machine',
          },
        ]

        this.machines = [
          'Universal Testing Machine',
          'Oven',
          'pH Meter',
          'CNC Lathe Machine',
        ]

        this.methods = ['ASTM E8', 'SNI 1974:2011', 'Internal SOP 2022']
      } finally {
        this.loading = false
      }
    },

    // === Tambah pengujian baru ===
    async addTest(payload) {
      try {
        this.loading = true
        const res = await api.post('/api/v1/tests', payload)
        const newTest = res.data.data
        this.tests.push(newTest)
        return { ok: true, data: newTest }
      } catch (err) {
        // fallback lokal (dummy)
        console.warn('⚠️ API tidak aktif, tambah ke dummy store saja.')
        const dummy = { id: nanoid(), ...payload }
        this.tests.push(dummy)
        return { ok: true, data: dummy, dummy: true }
      } finally {
        this.loading = false
      }
    },

    // === Edit / Update pengujian ===
    async updateTest(payload) {
      try {
        this.loading = true
        const { id, ...data } = payload
        // update ke API
        const res = await api.put(`/api/v1/tests/${id}`, data)
        const updated = res.data.data

        // update di state lokal
        const idx = this.tests.findIndex((t) => t.id === id)
        if (idx !== -1) this.tests[idx] = updated

        return { ok: true, data: updated }
      } catch (err) {
        console.warn('⚠️ API tidak aktif, update di dummy store saja.')
        const idx = this.tests.findIndex((t) => t.id === payload.id)
        if (idx !== -1) this.tests[idx] = { ...this.tests[idx], ...payload }
        return { ok: true, dummy: true }
      } finally {
        this.loading = false
      }
    },

    // === Hapus pengujian ===
    async removeTest(id) {
      try {
        this.loading = true
        await api.delete(`/api/v1/tests/${id}`)
        this.tests = this.tests.filter((t) => t.id !== id)
        return { ok: true }
      } catch (err) {
        console.warn('⚠️ API tidak aktif, hapus dari dummy store saja.')
        this.tests = this.tests.filter((t) => t.id !== id)
        return { ok: true, dummy: true }
      } finally {
        this.loading = false
      }
    },

    // === Mesin Uji ===
    async addMachine(MachineName) {
      if (!MachineName?.trim()) return
      try {
        const res = await api.post('/api/v1/machines', { MachineName })
        this.machines.push(res.data.data)
      } catch {
        console.warn('⚠️ API tidak aktif, tambah mesin ke dummy store.')
        this.machines.push(MachineName)
      }
    },
    async removeMachine(indexOrId) {
      try {
        const id =
          typeof indexOrId === 'number'
            ? this.machines[indexOrId].id
            : indexOrId
        await api.delete(`/api/v1/machines/${id}`)
        this.machines = this.machines.filter((m) => m.id !== id)
      } catch {
        console.warn('⚠️ API tidak aktif, hapus mesin dari dummy store.')
        if (typeof indexOrId === 'number')
          this.machines.splice(indexOrId, 1)
        else
          this.machines = this.machines.filter((m) => m.id !== indexOrId)
      }
    },

    // === Metode Uji ===
    async addMethod(MethodName) {
      if (!MethodName?.trim()) return
      try {
        const res = await api.post('/api/v1/methods', { MethodName })
        this.methods.push(res.data.data)
      } catch {
        console.warn('⚠️ API tidak aktif, tambah metode ke dummy store.')
        this.methods.push(MethodName)
      }
    },
    async removeMethod(indexOrId) {
      try {
        const id =
          typeof indexOrId === 'number'
            ? this.methods[indexOrId].id
            : indexOrId
        await api.delete(`/api/v1/methods/${id}`)
        this.methods = this.methods.filter((m) => m.id !== id)
      } catch {
        console.warn('⚠️ API tidak aktif, hapus metode dari dummy store.')
        if (typeof indexOrId === 'number')
          this.methods.splice(indexOrId, 1)
        else
          this.methods = this.methods.filter((m) => m.id !== indexOrId)
      }
    },
  },
})
