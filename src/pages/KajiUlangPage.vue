<template>
  <div class="space-y-3">
    <div
      v-if="!showForm"
      class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <h2 class="text-lg font-semibold text-surfaceDark sm:text-2xl">
        Daftar Kaji Ulang
      </h2>
      <button
        class="w-full rounded-lg bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-center text-white shadow-sm transition hover:opacity-90 sm:w-auto"
        @click="handleAdd"
      >
        Tambah Kaji Ulang
      </button>
    </div>

    <div
      v-if="!showForm"
      class="rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:p-4"
    >
      <DataTable
        :columns="columns"
        :rows="tableRows"
        searchable
        filterable
        search-field="orderNo"
        status-field="status"
        date-field="date"
        :status-options="statusOptions"
        mobile-mode="table"
        scroll-body-on-mobile
        body-scroll-height="55vh"
      >
        <template #sampleNo="{ value }">
          <span class="text-sm text-gray-700">{{ value || '-' }}</span>
        </template>
        <template #date="{ value }">
          <span class="text-sm text-gray-700">{{ formatDateDisplay(value) }}</span>
        </template>
        <template #status="{ value }">
          <Badge :status="value" />
        </template>
        <template #paymentReviewStatus="{ row }">
          <Badge :status="row.paymentBadgeStatus" />
        </template>
        <template #actions="{ row }">
          <div class="flex justify-center gap-2 text-surfaceDark">
            <button
              v-if="row.canReviewPayment"
              class="rounded-md bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100 hover:text-blue-800"
              @click="openPaymentReview(row)"
              title="Review Bukti Pembayaran"
            >
              <EyeIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canOpenForm"
              class="rounded-md bg-emerald-50 p-1.5 text-emerald-600 transition hover:bg-emerald-100 hover:text-emerald-800"
              @click="handleEdit(row)"
              title="Buka Form Kaji Ulang"
            >
              <PencilIcon class="h-5 w-5" />
            </button>
            <button
              v-if="row.canDelete"
              class="rounded-md bg-red-50 p-1.5 text-danger transition hover:bg-red-100 hover:text-red-700"
              @click="handleDelete(row)"
              title="Hapus Data"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <FormKajiUlang
      v-if="showForm"
      :form="form"
      :kajiUlangRows="reviewRows"
      :signatures="signatures"
      :tests="tests"
      :selectedCustomerAddress="form.customerAddress || ''"
      :getRowOptions="getRowOptions"
      @save-draft="saveDraft"
      @lolos-kaji-ulang="approveReview"
      @tolak="rejectReview"
      @close="closeForm"
    />

    <transition name="fade">
      <div
        v-if="showReviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      >
        <div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500">Review Bukti Pembayaran</p>
              <h3 class="text-lg font-semibold text-surfaceDark">
                Order {{ reviewingOrder?.orderNo || '-' }}
              </h3>
            </div>
            <button
              class="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              @click="closeReviewModal"
            >
              <span class="sr-only">Tutup</span>
              <XCircleIcon class="h-6 w-6" />
            </button>
          </div>

          <div class="space-y-4">
            <section class="rounded-xl border border-gray-200 p-4">
              <h4 class="mb-2 text-sm font-semibold text-surfaceDark">Detail Pembayaran</h4>
              <div class="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                <span>Customer: <strong class="text-surfaceDark">{{ reviewingOrder?.customerName || '-' }}</strong></span>
                <span>Total: <strong class="text-surfaceDark">Rp {{ formatCurrency(reviewingOrder?.paymentInfo?.total) }}</strong></span>
                <span>Dibayar: <strong class="text-surfaceDark">Rp {{ formatCurrency(reviewingOrder?.paymentInfo?.amountPaid) }}</strong></span>
                <span>Sisa: <strong class="text-surfaceDark">Rp {{ formatCurrency(reviewingOrder?.paymentInfo?.outstanding) }}</strong></span>
              </div>
            </section>

            <section class="rounded-xl border border-gray-200 p-4">
              <h4 class="mb-3 text-sm font-semibold text-surfaceDark">Lampiran Bukti</h4>
              <div v-if="!reviewFiles.length" class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                Tidak ada file yang diunggah.
              </div>
              <div v-else class="grid gap-4 sm:grid-cols-2">
                <article
                  v-for="file in reviewFiles"
                  :key="file.id"
                  class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div class="h-48 bg-white">
                    <img
                      v-if="file.previewUrl && file.type?.startsWith('image/')"
                      :src="file.previewUrl"
                      :alt="file.name"
                      class="h-full w-full object-contain"
                    />
                    <div
                      v-else
                      class="flex h-full flex-col items-center justify-center text-sm text-gray-500"
                    >
                      <span class="font-semibold">{{ file.name }}</span>
                      <span>{{ file.type || 'Lampiran' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between bg-white px-3 py-2 text-xs text-gray-600">
                    <span class="truncate">{{ file.name }}</span>
                    <span>{{ formatFileSize(file.size) }}</span>
                  </div>
                </article>
              </div>
            </section>

            <section class="rounded-xl border border-gray-200 p-4">
              <label class="mb-1 block text-sm font-medium text-surfaceDark" for="review-note">
                Catatan Review
              </label>
              <textarea
                id="review-note"
                v-model="reviewNote"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-primaryLight focus:outline-none focus:ring-1 focus:ring-primaryLight"
                placeholder="Catatan untuk pemohon atau alasan penolakan (opsional)"
              ></textarea>
            </section>

            <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:w-auto"
                @click="closeReviewModal"
              >
                Batal
              </button>
              <button
                class="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 sm:w-auto"
                @click="approvePaymentEvidence"
              >
                Setujui Bukti
              </button>
              <button
                class="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 sm:w-auto"
                @click="rejectPaymentEvidence"
              >
                Tolak & Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import DataTable from '@/components/DataTable.vue';
import Badge from '@/components/Badge.vue';
import FormKajiUlang from '@/components/form/FormKajiUlang.vue';
import { PencilIcon, TrashIcon, EyeIcon, XCircleIcon } from '@heroicons/vue/24/outline';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useTestStore } from '@/stores/useTestStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { usePermintaanStore } from '@/stores/usePermintaanStore';

const kajiUlangStore = useKajiUlangStore();
const testStore = useTestStore();
const openConfirm = useConfirmDialog();
const permintaanStore = usePermintaanStore();

const showForm = ref(false);
const editingOrderId = ref(null);
const showReviewModal = ref(false);
const reviewingOrder = ref(null);
const reviewNote = ref('');
const reviewerName = 'Admin';

const form = reactive({
  orderNo: '',
  sampleNo: '',
  date: new Date().toISOString().slice(0, 10),
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  testType: '',
  note: '',
});

const reviewRows = reactive([
  { topic: 'Peralatan', result: '' },
  { topic: 'Personel', result: '' },
  { topic: 'Waktu', result: '' },
  { topic: 'Kondisi', result: '' },
  { topic: 'Laboratorium Subkontrak', result: '' },
]);

const signatures = reactive({ customer: null, admin: null });
const reviewFiles = computed(
  () => reviewingOrder.value?.paymentInfo?.transferFiles || [],
);

const columns = [
  { field: 'orderNo', title: 'ID Order', className: 'min-w-[150px]' },
  { field: 'sampleNo', title: 'Sample No', slotName: 'sampleNo', className: 'min-w-[140px]' },
  { field: 'date', title: 'Tanggal', slotName: 'date', className: 'min-w-[140px]' },
  { field: 'customerName', title: 'Pelanggan', className: 'hidden md:table-cell min-w-[160px]' },
  { field: 'status', title: 'Status', slotName: 'status', className: 'min-w-[150px]' },
  { field: 'paymentReviewStatus', title: 'Review Pembayaran', slotName: 'paymentReviewStatus', className: 'min-w-[180px]' },
  { field: 'testType', title: 'Jenis Pengujian', className: 'hidden lg:table-cell min-w-[160px]' },
  { field: 'actions', title: 'Aksi', slotName: 'actions', className: 'text-center' },
];

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'payment_pending_review', label: 'Menunggu Review Pembayaran' },
  { value: 'ready_for_kaji_ulang', label: 'Siap Kaji Ulang' },
  { value: 'payment_verified', label: 'Pembayaran Terverifikasi' },
  { value: 'payment_review_rejected', label: 'Bukti Ditolak' },
  { value: 'pending_validation', label: 'Menunggu Validasi' },
  { value: 'in_testing', label: 'Proses Pengujian' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const tableRows = computed(() =>
  kajiUlangStore.orders
    .filter((order) => !!order.paymentInfo && order.status !== 'cancelled')
    .map((order) => {
      const reviewStatus = order.paymentInfo?.reviewStatus || 'pending';
      const paymentBadgeStatus =
        reviewStatus === 'approved'
          ? 'payment_verified'
          : reviewStatus === 'rejected'
            ? 'payment_review_rejected'
            : 'payment_pending_review';
      return {
        id: order.id,
        orderNo: order.orderNo,
        sampleNo: order.sampleNo || '',
        date: order.date || '',
        customerName: order.customerName || '',
        status: order.status,
        testType: order.testType || '-',
        paymentReviewStatus: reviewStatus,
        paymentBadgeStatus,
        paymentInfo: order.paymentInfo,
        canReviewPayment: reviewStatus !== 'approved' && order.status !== 'cancelled',
        canOpenForm:
          reviewStatus === 'approved' &&
          !['in_testing', 'completed'].includes(order.status),
        canDelete: !['in_testing', 'completed'].includes(order.status),
      };
    })
);

const tests = computed(() => testStore.tests || []);

function resetForm() {
  Object.assign(form, {
    orderNo: '',
    sampleNo: '',
    date: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    testType: '',
    note: '',
  });
  reviewRows.forEach((row) => (row.result = ''));
  signatures.customer = null;
  signatures.admin = null;
  editingOrderId.value = null;
}

function handleAdd() {
  const nextReady = kajiUlangStore.readyForReview[0];
  if (!nextReady) {
    alert('Belum ada permintaan dengan pembayaran terverifikasi.');
    return;
  }
  handleEdit({ id: nextReady.id, orderNo: nextReady.orderNo });
}

function handleEdit(row) {
  const order =
    kajiUlangStore.orders.find((o) => o.id === row.id) ||
    kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo);
  if (!order) return;
  if (order.paymentInfo?.reviewStatus !== 'approved') {
    alert('Bukti pembayaran belum disetujui. Selesaikan review terlebih dahulu.');
    return;
  }
  Object.assign(form, {
    orderNo: order.orderNo || '',
    sampleNo: order.sampleNo || '',
    date: order.date || new Date().toISOString().slice(0, 10),
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    customerAddress: order.customerAddress || '',
    testType: order.testType || '',
    note: order.note || '',
  });
  reviewRows.splice(0, reviewRows.length, ...(order.kajiUlangRows || []).map((row) => ({ ...row })));
  signatures.customer = order.kajiUlangSignatures?.customer || null;
  signatures.admin = order.kajiUlangSignatures?.admin || null;
  editingOrderId.value = order.id;
  showForm.value = true;
}

async function handleDelete(row) {
  const ok = await openConfirm({
    title: 'Hapus data kaji ulang?',
    message: `Data kaji ulang untuk order ${row.orderNo} akan dihapus.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!ok) return;
  kajiUlangStore.removeOrder(row.id ?? row.orderNo);
}

function openPaymentReview(row) {
  const order =
    kajiUlangStore.orders.find((o) => o.id === row.id) ||
    kajiUlangStore.orders.find((o) => o.orderNo === row.orderNo);
  if (!order?.paymentInfo) {
    alert('Tidak ada bukti pembayaran yang dapat direview.');
    return;
  }
  reviewingOrder.value = order;
  reviewNote.value = order.paymentInfo.reviewNote || '';
  showReviewModal.value = true;
}

function closeReviewModal() {
  reviewingOrder.value = null;
  reviewNote.value = '';
  showReviewModal.value = false;
}

async function approvePaymentEvidence() {
  if (!reviewingOrder.value) return;
  const updated = kajiUlangStore.reviewPayment(reviewingOrder.value.id, {
    approved: true,
    reviewer: reviewerName,
    note: reviewNote.value,
  });
  if (updated) {
    await permintaanStore.updateRequest(updated.orderNo, {
      status: 'payment_verified',
      paymentInfo: updated.paymentInfo,
    });
    alert('Bukti pembayaran disetujui.');
  }
  closeReviewModal();
}

async function rejectPaymentEvidence() {
  if (!reviewingOrder.value) return;
  const confirmed = await openConfirm({
    title: 'Tolak bukti pembayaran?',
    message: 'Permintaan akan dibatalkan jika bukti tidak valid.',
    confirmLabel: 'Tolak',
    variant: 'danger',
  });
  if (!confirmed) return;
  const updated = kajiUlangStore.reviewPayment(reviewingOrder.value.id, {
    approved: false,
    reviewer: reviewerName,
    note: reviewNote.value,
  });
  if (updated) {
    await permintaanStore.updateRequest(updated.orderNo, {
      status: 'payment_review_rejected',
      paymentInfo: updated.paymentInfo,
    });
    alert('Bukti pembayaran ditolak dan permintaan dibatalkan.');
  }
  closeReviewModal();
}

function getRowOptions(topic) {
  const yesNo = ['Peralatan', 'Personel', 'Waktu', 'Laboratorium Subkontrak'];
  if (yesNo.includes(topic)) return ['Ada', 'Tidak'];
  if (topic === 'Kondisi') return ['Siap Uji', 'Prepare Sampel'];
  return ['Ada', 'Tidak'];
}

function saveDraft() {
  if (!editingOrderId.value) {
    alert('Draft disimpan (dummy)');
    return;
  }
  kajiUlangStore.updateOrder(editingOrderId.value, {
    sampleNo: form.sampleNo,
    customerName: form.customerName,
    customerPhone: form.customerPhone,
    customerAddress: form.customerAddress,
    testType: form.testType,
    note: form.note,
  });
  kajiUlangStore.updateReview(editingOrderId.value, {
    rows: reviewRows,
    note: form.note,
    signatures,
  });
  alert('Draft disimpan');
}

function approveReview() {
  if (editingOrderId.value) {
    kajiUlangStore.updateOrder(editingOrderId.value, {
      sampleNo: form.sampleNo,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      testType: form.testType,
      note: form.note,
    });
    kajiUlangStore.updateReview(editingOrderId.value, {
      rows: reviewRows,
      note: form.note,
      signatures,
      status: 'pending_validation',
      validator: 'Manajer Teknis',
    });
  } else {
    const created = kajiUlangStore.addOrder({
      orderNo: form.orderNo,
      sampleNo: form.sampleNo,
      date: form.date,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      testType: form.testType,
      note: form.note,
      status: 'pending_validation',
      paymentInfo: { status: 'payment_verified', reviewStatus: 'approved' },
    });
    kajiUlangStore.updateReview(created.id, {
      rows: reviewRows,
      note: form.note,
      signatures,
      status: 'pending_validation',
      validator: 'Manajer Teknis',
    });
  }
  showForm.value = false;
}

function rejectReview() {
  if (editingOrderId.value) {
    kajiUlangStore.updateReview(editingOrderId.value, {
      rows: reviewRows,
      note: form.note,
      signatures,
      status: 'rejected',
    });
  }
  showForm.value = false;
}

function closeForm() {
  showForm.value = false;
  resetForm();
}

function formatDateDisplay(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
</script>
