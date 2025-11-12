import { defineStore } from 'pinia';

function createDefaultReviewRows() {
  return [
    { topic: 'Peralatan', result: '' },
    { topic: 'Personel', result: '' },
    { topic: 'Waktu', result: '' },
    { topic: 'Kondisi', result: '' },
    { topic: 'Laboratorium Subkontrak', result: '' },
  ];
}

function cloneReviewRows(rows = []) {
  return rows.map((row) => ({
    topic: row.topic || '',
    result: row.result || '',
  }));
}

function sumTestItems(testItems = []) {
  return testItems.reduce((total, item) => {
    const price = Math.max(0, Number(item.price ?? 0));
    const quantity = Math.max(1, Number(item.quantity ?? 1));
    return total + price * quantity;
  }, 0);
}

function normalizeSampleNo(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function extractSampleIndex(value) {
  const sample = normalizeSampleNo(value);
  if (!sample) return null;
  const match = sample.match(/(\d+)(?!.*\d)/);
  return match ? Number(match[1]) : null;
}

function getSampleGroupKey(item = {}) {
  if (item.sampleGroupKey) return String(item.sampleGroupKey).trim();
  if (item.testCode) return String(item.testCode).trim();
  if (item.testId) return String(item.testId).split('-')[0];
  if (item.testName) return String(item.testName).trim();
  if (item.name) return String(item.name).trim();
  return 'default-group';
}

function enrichTestItems(testItems = []) {
  if (!Array.isArray(testItems)) return [];
  const counters = new Map();
  return testItems.map((item) => {
    const prepared = { ...item };
    const groupKey = getSampleGroupKey(prepared);
    const currentMax = counters.get(groupKey) || 0;
    const existingSample = normalizeSampleNo(prepared.sampleNo);
    if (existingSample) {
      const parsed = extractSampleIndex(existingSample);
      const nextMax = parsed ? Math.max(currentMax, parsed) : currentMax;
      counters.set(groupKey, nextMax);
      prepared.sampleNo = existingSample;
      return prepared;
    }
    const nextIndex = currentMax + 1;
    counters.set(groupKey, nextIndex);
    prepared.sampleNo = String(nextIndex).padStart(3, '0');
    return prepared;
  });
}

function normalizeTransferFiles(list = [], orderNo = '') {
  return Array.isArray(list)
    ? list
        .filter(Boolean)
        .map((item, idx) => ({
          id:
            item.id ||
            `${orderNo || 'order'}-evidence-${idx + 1}`,
          name: item.name || `Lampiran-${idx + 1}`,
          size: item.size || 0,
          type: item.type || 'application/octet-stream',
          previewUrl: item.previewUrl || '',
        }))
    : [];
}

function normalizePaymentDetail(detail = {}, orderNo = '') {
  if (!detail) return null;
  const reviewStatus = detail.reviewStatus || 'pending';
  const statusMapping = {
    approved: 'payment_verified',
    rejected: 'payment_review_rejected',
  };
  return {
    ...detail,
    status:
      detail.status ||
      statusMapping[reviewStatus] ||
      'payment_pending_review',
    reviewStatus,
    reviewedBy: detail.reviewedBy || '',
    reviewedAt: detail.reviewedAt || null,
    reviewNote: detail.reviewNote || '',
    transferFiles: normalizeTransferFiles(detail.transferFiles, orderNo),
  };
}

function deriveOrderStatusFromPayment(paymentInfo) {
  if (!paymentInfo) return 'draft';
  if (paymentInfo.reviewStatus === 'approved') return 'ready_for_kaji_ulang';
  if (paymentInfo.reviewStatus === 'rejected') return 'payment_review_rejected';
  return 'payment_pending_review';
}

function buildDummyOrder(base = {}, paymentDetail = {}) {
  const paymentInfo = normalizePaymentDetail(paymentDetail, base.orderNo);
  const orderYear = base.orderYear || (base.date ? String(base.date).slice(0, 4) : '');
  return {
    id: base.id,
    requestId: base.requestId || '',
    orderNo: base.orderNo || '',
    orderNumber: base.orderNumber ?? null,
    orderYear,
    sampleNo: base.sampleNo || '',
    date: base.date || new Date().toISOString().slice(0, 10),
    status: deriveOrderStatusFromPayment(paymentInfo),
    total: paymentInfo?.total ?? 0,
    downPayment: paymentInfo?.amountPaid ?? 0,
    remaining: paymentInfo?.outstanding ?? 0,
    customerName: base.customerName || '',
    customerPhone: base.customerPhone || '',
    customerAddress: base.customerAddress || '',
    testType: base.testType || '',
    note: base.note || '',
    testItems: enrichTestItems(base.testItems),
    paymentInfo,
    kajiUlangRows: createDefaultReviewRows(),
    kajiUlangNote: '',
    kajiUlangSignatures: {
      admin: '',
      customer: base.customerName || '',
    },
    kajiUlangValidatedAt: null,
    kajiUlangValidatedBy: null,
  };
}

function createDummyOrders() {
  const approvedOrder = buildDummyOrder(
    {
      id: 1,
      requestId: '01K-A1',
      orderNo: '01K8WJ96E56HTJCC9CJ97MM78P',
      orderNumber: 1,
      sampleNo: '001',
      date: '2025-01-06',
      customerName: 'PT Maju Jaya Sejahtera',
      customerPhone: '021-555-0101',
      customerAddress: 'Jl. Merdeka No. 12, Tegal',
      testType: 'Uji Tarik Baja',
      note: 'Prioritas tinggi, diperlukan sebelum 15 Jan',
      testItems: [
        {
          testId: 'UTK-001',
          testName: 'Uji Tarik',
          objectName: 'Besi Beton',
          price: 250000,
          quantity: 2,
        },
        {
          testId: 'UKH-002',
          testName: 'Uji Kekerasan',
          objectName: 'Pelat Baja',
          price: 150000,
          quantity: 1,
        },
      ],
    },
    {
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
    }
  );

  const waitingReviewOrder = buildDummyOrder(
    {
      id: 2,
      requestId: '01K-B2',
      orderNo: 'ORD-202501-004',
      orderNumber: 2,
      sampleNo: 'S-2025-004',
      date: '2025-01-08',
      customerName: 'CV Sinar Terang Abadi',
      customerPhone: '0283-778899',
      customerAddress: 'Jl. Sawo No. 8, Slawi',
      testType: 'Uji Komposisi Kimia',
      note: 'Sertakan laporan komposisi lengkap.',
      testItems: [
        {
          testId: 'UKK-010',
          testName: 'Uji Komposisi Kimia',
          objectName: 'Serbuk Aluminium',
          price: 375000,
          quantity: 1,
        },
      ],
    },
    {
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
    }
  );

  const rejectedOrder = buildDummyOrder(
    {
      id: 3,
      requestId: '01K-C3',
      orderNo: 'ORD-202501-006',
      orderNumber: 3,
      sampleNo: 'S-2025-006',
      date: '2025-01-09',
      customerName: 'PT Sentosa Logam',
      customerPhone: '021-770099',
      customerAddress: 'Jl. Rajawali No. 17, Brebes',
      testType: 'Uji Kekuatan Tekan',
      note: 'Butuh penjadwalan ulang setelah pembayaran sah.',
      testItems: [
        {
          testId: 'UKT-015',
          testName: 'Uji Kekuatan Tekan',
          objectName: 'Besi Cor',
          price: 420000,
          quantity: 1,
        },
      ],
    },
    {
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
    }
  );

  rejectedOrder.status = 'payment_review_rejected';

  return [approvedOrder, waitingReviewOrder, rejectedOrder];
}

export const useKajiUlangStore = defineStore('kajiUlang', {
  state: () => ({
    orders: createDummyOrders(),
  }),

  getters: {
    pendingPaymentReview(state) {
      return state.orders.filter(
        (order) =>
          order.paymentInfo &&
          order.paymentInfo.reviewStatus !== 'approved' &&
          order.status !== 'cancelled'
      );
    },
    readyForReview(state) {
      return state.orders.filter(
        (order) =>
          order.paymentInfo &&
          order.paymentInfo.reviewStatus === 'approved' &&
          order.status !== 'cancelled'
      );
    },
  },

  actions: {
    getNextId() {
      return this.orders.length
        ? Math.max(...this.orders.map((o) => o.id)) + 1
        : 1;
    },

    addOrder(order) {
      const nextId = this.getNextId();
      const paymentInfo = normalizePaymentDetail(order?.paymentInfo, order?.orderNo);
      const newOrder = {
        id: nextId,
        kajiUlangRows: createDefaultReviewRows(),
        kajiUlangNote: '',
        kajiUlangSignatures: { admin: '', customer: '' },
        kajiUlangValidatedAt: null,
        kajiUlangValidatedBy: null,
        paymentInfo,
        status: deriveOrderStatusFromPayment(paymentInfo),
        ...order,
      };
      this.orders.push(newOrder);
      return newOrder;
    },

    updateOrder(id, updates) {
      const idx = this.orders.findIndex((o) => o.id === id);
      if (idx !== -1) {
        const current = this.orders[idx];
        const paymentInfo = updates.paymentInfo
          ? normalizePaymentDetail(updates.paymentInfo, current.orderNo)
          : current.paymentInfo;
        this.orders[idx] = {
          ...current,
          ...updates,
          paymentInfo,
          status:
            updates.status ||
            deriveOrderStatusFromPayment(paymentInfo) ||
            current.status,
        };
      }
    },

    setStatus(id, status) {
      const order = this.orders.find((o) => o.id === id);
      if (order) order.status = status;
    },

    attachPayment(id, amount) {
      const order = this.orders.find((o) => o.id === id);
      if (order) {
        order.downPayment += amount;
        order.remaining = Math.max(order.total - order.downPayment, 0);
      }
    },

    assignStaff(id, staffAssignments) {
      const order = this.orders.find((o) => o.id === id);
      if (order) Object.assign(order, staffAssignments);
    },

    upsertFromRequest(request = {}, { paymentDetail = null } = {}) {
      if (!request) return null;
      const requestId = request.idOrder || request.id || null;
      const testItems = enrichTestItems(request.testItems);
      const totalFromItems = sumTestItems(testItems);
      const normalizedPayment = normalizePaymentDetail(
        paymentDetail,
        request.idOrder || request.orderNo || ''
      );
      const payload = {
        requestId,
        orderNo: request.idOrder || request.orderNo || '',
        orderNumber:
          request.orderNumber !== undefined && request.orderNumber !== null
            ? Number(request.orderNumber)
            : null,
        orderYear: request.orderYear || (request.entryDate ? String(request.entryDate).slice(0, 4) : ''),
        sampleNo: request.sampleNo || '',
        date: request.entryDate || new Date().toISOString().slice(0, 10),
        status: deriveOrderStatusFromPayment(normalizedPayment),
        total: normalizedPayment?.total ?? totalFromItems,
        downPayment:
          normalizedPayment?.amountPaid ??
          normalizedPayment?.total ??
          totalFromItems,
        remaining:
          normalizedPayment?.outstanding ??
          Math.max(
            (normalizedPayment?.total ?? totalFromItems) -
              (normalizedPayment?.amountPaid ?? 0),
            0
          ),
        customerName: request.customerName || '',
        customerPhone: request.phoneNumber || request.customerPhone || '',
        customerAddress: request.address || request.customerAddress || '',
        testType:
          (testItems[0]?.testName ||
            testItems[0]?.name ||
            request.testCategory ||
            request.purpose) ?? '',
        note: request.note || '',
        testItems,
        paymentInfo: normalizedPayment,
      };

      const existingIdx = this.orders.findIndex(
        (order) =>
          order.requestId === requestId || order.orderNo === payload.orderNo
      );

      if (existingIdx !== -1) {
        const existing = this.orders[existingIdx];
        const lockedStatuses = ['in_testing', 'completed'];
        const nextStatus = lockedStatuses.includes(existing.status)
          ? existing.status
          : payload.status;
        this.orders[existingIdx] = {
          ...existing,
          ...payload,
          status: nextStatus,
          paymentInfo: payload.paymentInfo || existing.paymentInfo,
          kajiUlangRows:
            existing.kajiUlangRows && existing.kajiUlangRows.length
              ? cloneReviewRows(existing.kajiUlangRows)
              : createDefaultReviewRows(),
        };
        return this.orders[existingIdx];
      }

      const newOrder = {
        id: this.getNextId(),
        ...payload,
        kajiUlangRows: createDefaultReviewRows(),
        kajiUlangNote: '',
        kajiUlangSignatures: {
          admin: '',
          customer: request.customerName || '',
        },
        kajiUlangValidatedAt: null,
        kajiUlangValidatedBy: null,
      };
      this.orders.push(newOrder);
      return newOrder;
    },

    reviewPayment(orderId, { approved, reviewer, note } = {}) {
      const idx = this.orders.findIndex(
        (order) => order.id === orderId || order.orderNo === orderId
      );
      if (idx === -1) return null;
      const current = this.orders[idx];
      if (!current.paymentInfo) return current;
      const reviewStatus = approved ? 'approved' : 'rejected';
      const status = approved
        ? 'ready_for_kaji_ulang'
        : 'cancelled';
      const paymentInfo = {
        ...current.paymentInfo,
        status: approved ? 'payment_verified' : 'payment_review_rejected',
        reviewStatus,
        reviewedBy: reviewer || '',
        reviewedAt: new Date().toISOString(),
        reviewNote: typeof note === 'string' ? note : current.paymentInfo.reviewNote || '',
      };
      this.orders[idx] = {
        ...current,
        status,
        paymentInfo,
      };
      return this.orders[idx];
    },

    updateReview(orderId, { rows, note, signatures, status, validator } = {}) {
      const idx = this.orders.findIndex(
        (order) => order.id === orderId || order.orderNo === orderId
      );
      if (idx === -1) return;
      const current = this.orders[idx];
      const nextRows = rows
        ? cloneReviewRows(rows)
        : cloneReviewRows(
            current.kajiUlangRows || createDefaultReviewRows()
          );
      this.orders[idx] = {
        ...current,
        kajiUlangRows: nextRows,
        kajiUlangNote:
          typeof note === 'string' ? note : current.kajiUlangNote,
        kajiUlangSignatures: signatures
          ? {
              admin: signatures.admin || '',
              customer: signatures.customer || '',
            }
          : current.kajiUlangSignatures,
        kajiUlangValidatedAt: validator
          ? new Date().toISOString()
          : current.kajiUlangValidatedAt,
        kajiUlangValidatedBy: validator || current.kajiUlangValidatedBy,
        status: status || current.status,
      };
    },

    removeOrder(id) {
      this.orders = this.orders.filter(
        (order) => order.id !== id && order.orderNo !== id
      );
    },
  },
});
