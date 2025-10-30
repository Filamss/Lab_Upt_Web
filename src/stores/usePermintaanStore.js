import { defineStore } from 'pinia';
import api from '@/services/apiServices';
import { useActivityStore } from '@/stores/useActivityStore';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';

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
  pending_payment: 'Menunggu Pembayaran',
  payment_pending_review: 'Menunggu Review Pembayaran',
  payment_verified: 'Pembayaran Terverifikasi',
  payment_review_rejected: 'Bukti Pembayaran Ditolak',
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
      `${request?.customerName || 'Pemohon'} - ${statusLabels[status] || status || 'Aktivitas'}`,
    status: statusLevel,
    referenceId: request?.idOrder || null,
    metadata: {
      status,
      customer: request?.customerName || '',
    },
  });
}

function createDummyRequests() {
  const entries = [
    {
      idOrder: 'ORD-202501-001',
      entryDate: '2025-01-04',
      customerName: 'PT Maju Jaya Sejahtera',
      phoneNumber: '021-555-0101',
      address: 'Jl. Merdeka No. 12, Tegal',
      jobCategory: 'Industri',
      workPackage: 'Audit Material',
      testItems: [
        {
          testId: 'UTK-001',
          testName: 'Uji Tarik',
          objectName: 'Besi Beton',
          quantity: 2,
          price: 250000,
        },
        {
          testId: 'UKH-002',
          testName: 'Uji Kekerasan',
          objectName: 'Pelat Baja',
          quantity: 1,
          price: 150000,
        },
      ],
      status: 'payment_verified',
      paymentInfo: {
        status: 'payment_verified',
        reviewStatus: 'approved',
        total: 650000,
        amountPaid: 650000,
        outstanding: 0,
        paymentDate: '2025-01-05T08:30:00Z',
        paymentDeadline: '2025-01-07T00:00:00Z',
        reviewedBy: 'Admin Pembayaran',
        reviewedAt: '2025-01-05T09:00:00Z',
        reviewNote: 'Bukti transfer jelas dan sesuai nominal.',
        transferFiles: [
          {
            id: 'ORD-202501-001-evidence-1',
            name: 'Bukti-Transfer-ORD-001.png',
            size: 245678,
            type: 'image/png',
            previewUrl: 'https://dummyimage.com/600x360/edf2f7/1a202c&text=Bukti+Transfer',
          },
        ],
      },
    },
    {
      idOrder: 'ORD-202501-004',
      entryDate: '2025-01-08',
      customerName: 'CV Sinar Terang Abadi',
      phoneNumber: '0283-778899',
      address: 'Jl. Sawo No. 8, Slawi',
      jobCategory: 'Kontraktor',
      workPackage: 'Proyek Gedung',
      testItems: [
        {
          testId: 'UKK-010',
          testName: 'Uji Komposisi Kimia',
          objectName: 'Serbuk Aluminium',
          quantity: 1,
          price: 375000,
        },
      ],
      status: 'payment_pending_review',
      paymentInfo: {
        status: 'payment_pending_review',
        reviewStatus: 'pending',
        total: 375000,
        amountPaid: 375000,
        outstanding: 0,
        paymentDate: '2025-01-08T13:45:00Z',
        paymentDeadline: '2025-01-10T00:00:00Z',
        transferFiles: [
          {
            id: 'ORD-202501-004-evidence-1',
            name: 'Screenshot-Transfer-ORD-004.jpg',
            size: 198765,
            type: 'image/jpeg',
            previewUrl: 'https://dummyimage.com/600x360/fefcbf/7f5539&text=Screenshot',
          },
        ],
      },
    },
    {
      idOrder: 'ORD-202501-006',
      entryDate: '2025-01-09',
      customerName: 'PT Sentosa Logam',
      phoneNumber: '021-770099',
      address: 'Jl. Rajawali No. 17, Brebes',
      jobCategory: 'Kontraktor',
      workPackage: 'Proyek Infrastruktur',
      testItems: [
        {
          testId: 'UKT-015',
          testName: 'Uji Kekuatan Tekan',
          objectName: 'Besi Cor',
          quantity: 1,
          price: 420000,
        },
      ],
      status: 'payment_review_rejected',
      paymentInfo: {
        status: 'payment_review_rejected',
        reviewStatus: 'rejected',
        total: 420000,
        amountPaid: 0,
        outstanding: 420000,
        paymentDate: '2025-01-09T10:15:00Z',
        paymentDeadline: '2025-01-11T00:00:00Z',
        reviewedBy: 'Admin Pembayaran',
        reviewedAt: '2025-01-09T11:00:00Z',
        reviewNote: 'Foto tidak menunjukkan bukti transfer yang jelas.',
        transferFiles: [
          {
            id: 'ORD-202501-006-evidence-1',
            name: 'Foto-WhatsApp.jpg',
            size: 156789,
            type: 'image/jpeg',
            previewUrl: 'https://dummyimage.com/600x360/ffe0e0/9b2c2c&text=Foto+Blur',
          },
        ],
      },
    },
    {
      idOrder: 'ORD-202501-008',
      entryDate: '2025-01-10',
      customerName: 'CV Cahaya Mandiri',
      phoneNumber: '0812-9988-7766',
      address: 'Jl. Mawar No. 5, Tegal',
      jobCategory: 'UMKM',
      workPackage: 'Sertifikasi Produk',
      testItems: [
        {
          testId: 'UPH-021',
          testName: 'Uji pH',
          objectName: 'Sampel Minuman',
          quantity: 3,
          price: 90000,
        },
      ],
      status: 'pending_payment',
    },
    {
      idOrder: 'ORD-202501-010',
      entryDate: '2025-01-12',
      customerName: 'UD Sentosa Teknik',
      phoneNumber: '0857-4455-8899',
      address: 'Jl. Kenanga No. 3, Adiwerna',
      jobCategory: 'Internal',
      workPackage: 'Peremajaan Alat',
      testItems: [
        {
          testId: 'CAL-030',
          testName: 'Kalibrasi Alat Ukur',
          objectName: 'Alat Ukur Tekanan',
          quantity: 1,
          price: 180000,
        },
      ],
      status: 'draft',
    },
  ];

  return entries.map((entry) => normalizeRequestEntry(entry));
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
        const dummyRequests = createDummyRequests();
        this.requestList = dummyRequests;
        const kajiUlangStore = useKajiUlangStore();
        dummyRequests.forEach((request) => {
          kajiUlangStore.upsertFromRequest(request, {
            paymentDetail: request.paymentInfo || null,
          });
        });
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
        if (newData.paymentInfo) {
          const kajiUlangStore = useKajiUlangStore();
          kajiUlangStore.upsertFromRequest(newData, {
            paymentDetail: newData.paymentInfo,
          });
        }
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
        if (newData.paymentInfo) {
          const kajiUlangStore = useKajiUlangStore();
          kajiUlangStore.upsertFromRequest(newData, {
            paymentDetail: newData.paymentInfo,
          });
        }
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
      let updated = null;
      let dummy = false;
      try {
        const res = await api.put(`/api/v1/requests/${idOrder}`, payload);
        updated = normalizeRequestEntry(res.data.data);
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, update dummy store.');
        dummy = true;
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1) {
          updated = normalizeRequestEntry({
            ...this.requestList[idx],
            ...payload,
          });
        }
      }

      if (updated) {
        const idx = this.requestList.findIndex((r) => r.idOrder === idOrder);
        if (idx !== -1) {
          this.requestList[idx] = updated;
        } else {
          this.requestList.push(updated);
        }

        const kajiUlangStore = useKajiUlangStore();
        if (updated.paymentInfo) {
          kajiUlangStore.upsertFromRequest(updated, {
            paymentDetail: updated.paymentInfo,
          });
        } else {
          kajiUlangStore.removeOrder(idOrder);
        }

        if (payload?.status) {
          logRequestEvent({
            request: updated,
            status: payload.status,
            title: dummy ? 'Status permintaan diperbarui (offline)' : 'Status permintaan diperbarui',
            statusLevel: dummy ? 'warning' : 'success',
          });
        }
      }

      return { ok: true, data: updated, dummy };
    },

    /** Hapus permintaan */
    async deleteRequest(idOrder) {
      let dummy = false;
      try {
        await api.delete(`/api/v1/requests/${idOrder}`);
      } catch (err) {
        console.warn('[PermintaanStore] API tidak aktif, hapus dari dummy store.');
        dummy = true;
      }
      this.requestList = this.requestList.filter((r) => r.idOrder !== idOrder);
      const kajiUlangStore = useKajiUlangStore();
      kajiUlangStore.removeOrder(idOrder);
      return dummy ? { ok: true, dummy: true } : { ok: true };
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

