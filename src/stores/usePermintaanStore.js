import { defineStore } from 'pinia';
import api from '@/services/apiServices';
import { useActivityStore } from '@/stores/useActivityStore';

function normalizeRequestEntry(entry = {}) {
  const rawItems = Array.isArray(entry.testItems) ? entry.testItems : [];
  const testItems = rawItems
    .filter(Boolean)
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.price ?? item.testPrice ?? 0));
      const objectName =
        item.objectName ||
        item.testName ||
        item.name ||
        item.title ||
        '';
      return {
        testId: item.testId || item.id || '',
        testName:
          item.testName ||
          item.name ||
          item.title ||
          item.label ||
          '',
        objectName,
        price,
        quantity,
        unit: item.unit || '',
      };
    });

  const aggregated =
    testItems.length > 0
      ? testItems
          .map((item) => `${item.testName || item.testId || 'Pengujian'} (${item.quantity})`)
          .join(', ')
      : '';

  return {
    ...entry,
    status: entry.status || 'draft',
    workPackage: entry.workPackage || '',
    testItems,
    testCategory: aggregated || entry.testCategory || entry.purpose || '',
    purpose: entry.purpose || aggregated,
  };
}

const statusLabels = {
  draft: 'Draft',
  submitted: 'Diajukan',
  pending_payment: 'Menunggu Pembayaran',
  payment_pending: 'Menunggu Pembayaran',
  payment_received: 'Pembayaran Diterima',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
};

function deriveTypeByStatus(status = '') {
  if (!status) return 'request';
  if (status.includes('payment')) return 'payment';
  return 'request';
}

function logRequestEvent({ request, status, title, description, statusLevel = 'info' }) {
  const activityStore = useActivityStore();
  if (!activityStore) return;
  const eventType = status ? deriveTypeByStatus(status) : 'request';
  activityStore.addEvent({
    type: eventType,
    title: title || `Permintaan ${request?.idOrder || ''}`.trim(),
    description:
      description ||
      `${request?.customerName || 'Pemohon'} – ${statusLabels[status] || status || 'Aktivitas'}`,
    status: statusLevel,
    referenceId: request?.idOrder || null,
    metadata: {
      status,
      customer: request?.customerName || '',
    },
  });
}

/**
 * Store permintaan pelanggan sebelum masuk proses kaji ulang.
 * Siap terhubung dengan API namun tetap aman dengan fallback dummy.
 */
export const usePermintaanStore = defineStore('request', {
  state: () => ({
    requestList: [],
    loading: false,
    error: null,
  }),

  actions: {
    /** Fetch semua permintaan (API atau fallback dummy) */
    async fetchAll() {
      this.loading = true;
      try {
        const res = await api.get('/api/v1/requests');
        const remote = Array.isArray(res.data?.data) ? res.data.data : [];
        this.requestList = remote.map((entry) => normalizeRequestEntry(entry));
        this.error = null;
      } catch (err) {
        console.warn('[PermintaanStore] API belum tersedia, memakai dummy data.');
        this.error = 'Dummy mode aktif (API belum terhubung).';
        this.requestList = [
          normalizeRequestEntry({
            idOrder: 'ORD-20251001-123',
            entryDate: '2025-10-01',
            customerName: 'CV. Sinar Baja Elektrik',
            phoneNumber: '081234567890',
            address: 'Jl. Merpati No. 23, Tegal',
            jobCategory: 'IKM',
            workPackage: 'Paket Sertifikasi A',
            testItems: [
              { testId: 'dummy-utk', testName: 'Uji Tarik', objectName: 'Baut Baja', quantity: 2, price: 250000 },
              { testId: 'dummy-hard', testName: 'Uji Kekerasan', objectName: 'Plat Baja', quantity: 1, price: 175000 },
            ],
            status: 'draft',
            createdAt: '2025-10-01T09:00:00Z',
          }),
          normalizeRequestEntry({
            idOrder: 'ORD-20251005-321',
            entryDate: '2025-10-05',
            customerName: 'PT. Baja Mulya',
            phoneNumber: '081298765432',
            address: 'Jl. Raya Industri No. 45, Slawi',
            jobCategory: 'Kontraktor',
            workPackage: 'Proyek Jembatan',
            testItems: [
              { testId: 'dummy-komp', testName: 'Uji Komposisi Kimia', objectName: 'Sampel Beton Jembatan', quantity: 3, price: 320000 },
            ],
            status: 'pending_payment',
            createdAt: '2025-10-05T13:20:00Z',
          }),
          normalizeRequestEntry({
            idOrder: 'ORD-20251008-555',
            entryDate: '2025-10-08',
            customerName: 'UD. Karya Logam',
            phoneNumber: '082233445566',
            address: 'Jl. Ahmad Yani No. 12, Adiwerna',
            jobCategory: 'Internal',
            workPackage: 'Maintenance Mesin',
            testItems: [
              { testId: 'dummy-cnc', testName: 'Pengujian CNC', objectName: 'Pisau CNC', quantity: 1, price: 450000 },
            ],
            status: 'payment_received',
            createdAt: '2025-10-08T10:15:00Z',
          }),
        ];
      } finally {
        this.loading = false;
      }
    },

    /** Tambah permintaan baru */
    async addRequest(data) {
      this.loading = true;
      try {
        const res = await api.post('/api/v1/requests', data);
        const newData = normalizeRequestEntry(res.data.data);
        this.requestList.push(newData);
        logRequestEvent({
          request: newData,
          status: newData.status,
          title: 'Permintaan baru dibuat',
          description: `${newData.customerName || 'Pemohon'} membuat permintaan ${newData.idOrder || ''}`,
          statusLevel: 'success',
        });
        return { ok: true, data: newData };
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, simpan ke dummy store.');
        const newData = normalizeRequestEntry({
          ...data,
          idOrder: data.idOrder || this.generateOrderId(),
          status: data.status || 'draft',
          createdAt: new Date().toISOString(),
        });
        this.requestList.push(newData);
        logRequestEvent({
          request: newData,
          status: newData.status,
          title: 'Permintaan dicatat lokal',
          description: `${newData.customerName || 'Pemohon'} membuat permintaan (offline) ${newData.idOrder || ''}`,
          statusLevel: 'warning',
        });
        return { ok: true, data: newData, dummy: true };
      } finally {
        this.loading = false;
      }
    },

    /** Update permintaan */
    async updateRequest(idOrder, payload) {
      try {
        const res = await api.put(`/api/v1/requests/${idOrder}`, payload);
        const updated = normalizeRequestEntry(res.data.data);
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1) this.requestList[idx] = updated;
        if (payload?.status) {
          logRequestEvent({
            request: updated,
            status: payload.status,
            title: 'Status permintaan diperbarui',
            statusLevel: 'success',
          });
        }
        return { ok: true, data: updated };
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, update dummy store.');
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1) {
          const updated = normalizeRequestEntry({
            ...this.requestList[idx],
            ...payload,
          });
          this.requestList[idx] = updated;
          if (payload?.status) {
            logRequestEvent({
              request: updated,
              status: payload.status,
              title: 'Status permintaan diperbarui (offline)',
              statusLevel: 'warning',
            });
          }
        }
        return { ok: true, dummy: true };
      }
    },

    /** Hapus permintaan */
    async deleteRequest(idOrder) {
      try {
        await api.delete(`/api/v1/requests/${idOrder}`);
        this.requestList = this.requestList.filter((r) => r.idOrder !== idOrder);
        return { ok: true };
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, hapus dari dummy store.');
        this.requestList = this.requestList.filter((r) => r.idOrder !== idOrder);
        return { ok: true, dummy: true };
      }
    },

    /** Tandai permintaan disetujui */
    approveRequest(idOrder) {
      const item = this.requestList.find((r) => r.idOrder === idOrder);
      if (item) {
        item.status = 'approved';
        logRequestEvent({
          request: item,
          status: 'approved',
          title: 'Permintaan disetujui',
          statusLevel: 'success',
        });
      }
    },

    /** Generate ID Order otomatis */
    generateOrderId() {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomNum = Math.floor(100 + Math.random() * 900);
      return `ORD-${dateStr}-${randomNum}`;
    },

    /** Cari berdasarkan ID (case-insensitive, minimal 8 karakter) */
    searchById(query) {
      if (!query || query.length < 8) return [];
      const q = query.toLowerCase();
      return this.requestList.filter((r) =>
        r.idOrder?.toLowerCase().includes(q)
      );
    },

    /** Alias untuk kompatibilitas lama */
    searchPermintaanById(query) {
      return this.searchById(query);
    },
  },
});
