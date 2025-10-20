import { defineStore } from 'pinia';
import api from '@/services/apiServices';

/**
 * 🧾 Request Store (Permintaan)
 * Menyimpan data permintaan pelanggan sebelum masuk proses kaji ulang.
 * Siap untuk API & tetap aman dengan dummy fallback.
 */
export const usePermintaanStore = defineStore('request', {
  state: () => ({
    requestList: [],
    loading: false,
    error: null,
  }),

  actions: {
    /** 🔄 Fetch semua permintaan (API → fallback dummy) */
    async fetchAll() {
      this.loading = true;
      try {
        // 🔗 Coba ambil data dari backend
        const res = await api.get('/api/v1/requests');
        this.requestList = res.data?.data || [];
        this.error = null;
      } catch (err) {
        console.warn('⚠️ API belum tersedia, pakai dummy data sementara.');
        this.error = 'Dummy mode aktif (API belum terhubung).';

        // ==== Dummy Data Lokal ====
        this.requestList = [
          {
            idOrder: 'ORD-20251001-123',
            entryDate: '2025-10-01',
            customerName: 'CV. Sinar Baja Elektrik',
            phoneNumber: '081234567890',
            address: 'Jl. Merpati No. 23, Tegal',
            purpose: 'Uji tarik bahan baja untuk sertifikasi mutu.',
            jobCategory: 'IKM',
            status: 'new',
            createdAt: '2025-10-01T09:00:00Z',
          },
          {
            idOrder: 'ORD-20251005-321',
            entryDate: '2025-10-05',
            customerName: 'PT. Baja Mulya',
            phoneNumber: '081298765432',
            address: 'Jl. Raya Industri No. 45, Slawi',
            purpose: 'Pengujian komposisi kimia baja karbon.',
            jobCategory: 'Kontraktor',
            status: 'approved',
            createdAt: '2025-10-05T13:20:00Z',
          },
          {
            idOrder: 'ORD-20251008-555',
            entryDate: '2025-10-08',
            customerName: 'UD. Karya Logam',
            phoneNumber: '082233445566',
            address: 'Jl. Ahmad Yani No. 12, Adiwerna',
            purpose: 'Pemotongan CNC komponen mesin industri.',
            jobCategory: 'Internal',
            status: 'pending_validation',
            createdAt: '2025-10-08T10:15:00Z',
          },
        ];
      } finally {
        this.requestList = this.requestList.map((r) => ({
          ...r,
          status: r.status || 'new', // hanya isi default kalau belum ada
        }));
        this.loading = false;
      }
    },

    /** ➕ Tambah permintaan baru */
    async addRequest(data) {
      this.loading = true;
      try {
        const res = await api.post('/api/v1/requests', data);
        const newData = res.data.data;
        this.requestList.push(newData);
        return { ok: true, data: newData };
      } catch (err) {
        console.warn('⚠️ API tidak aktif, simpan ke dummy store.');
        const newData = {
          ...data,
          idOrder: data.idOrder || this.generateOrderId(),
          status: data.status || 'new',
          createdAt: new Date().toISOString(),
        };
        this.requestList.push(newData);
        return { ok: true, data: newData, dummy: true };
      } finally {
        this.loading = false;
      }
    },

    /** ✏️ Update permintaan */
    async updateRequest(idOrder, payload) {
      try {
        const res = await api.put(`/api/v1/requests/${idOrder}`, payload);
        const updated = res.data.data;
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1) this.requestList[idx] = updated;
        return { ok: true, data: updated };
      } catch {
        console.warn('⚠️ API tidak aktif, update dummy store.');
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1)
          this.requestList[idx] = { ...this.requestList[idx], ...payload };
        return { ok: true, dummy: true };
      }
    },

    /** ❌ Hapus permintaan */
    async deleteRequest(idOrder) {
      try {
        await api.delete(`/api/v1/requests/${idOrder}`);
        this.requestList = this.requestList.filter(
          (r) => r.idOrder !== idOrder
        );
        return { ok: true };
      } catch {
        console.warn('⚠️ API tidak aktif, hapus dari dummy store.');
        this.requestList = this.requestList.filter(
          (r) => r.idOrder !== idOrder
        );
        return { ok: true, dummy: true };
      }
    },

    /** ✅ Tandai permintaan disetujui */
    approveRequest(idOrder) {
      const item = this.requestList.find((r) => r.idOrder === idOrder);
      if (item) item.status = 'approved';
    },

    /** 🧩 Generate ID Order otomatis */
    generateOrderId() {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(100 + Math.random() * 900);
      return `ORD-${dateStr}-${randomNum}`;
    },

    /** 🔍 Cari berdasarkan ID (case-insensitive, min 8 karakter) */
    searchById(query) {
      if (!query || query.length < 8) return [];
      const q = query.toLowerCase();
      return this.requestList.filter((r) =>
        r.idOrder?.toLowerCase().includes(q)
      );
    },

    /** 🧩 Alias untuk kompatibilitas lama */
    searchPermintaanById(query) {
      return this.searchById(query);
    },
  },
});
