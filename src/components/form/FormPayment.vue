<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <div class="w-[95vw] max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto">
      <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500">Invoice Pembayaran</p>
          <h3 class="text-lg font-semibold text-surfaceDark">
            Permintaan {{ formattedOrderId }}
          </h3>
        </div>
        <button
          class="text-gray-500 hover:text-gray-700 transition"
          @click="handleClose"
        >
          <span class="sr-only">Tutup</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="px-6 py-6 space-y-6">
        <div class="grid gap-6 md:grid-cols-[2fr_1fr]">
          <section class="space-y-4">
            <div class="rounded-xl border border-gray-200 overflow-hidden">
              <table class="min-w-full text-sm">
                <thead class="bg-muted text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th class="px-3 py-2 text-center">No</th>
                    <th class="px-3 py-2 text-left">Jenis Pengujian</th>
                    <th class="px-3 py-2 text-left">Nama Objek Uji</th>
                    <th class="px-3 py-2 text-right">Biaya Satuan</th>
                    <th class="px-3 py-2 text-right">Jumlah</th>
                    <th class="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, index) in testRows"
                    :key="`payment-row-${index}`"
                    class="odd:bg-white even:bg-gray-50"
                  >
                    <td class="px-3 py-2 text-center">{{ index + 1 }}</td>
                    <td class="px-3 py-2 font-medium text-gray-700">
                      {{ row.testName || '-' }}
                    </td>
                    <td class="px-3 py-2 text-gray-600">
                      {{ row.objectName || '-' }}
                    </td>
                    <td class="px-3 py-2 text-right text-gray-700">
                      Rp {{ formatCurrency(row.price) }}
                    </td>
                    <td class="px-3 py-2 text-right text-gray-700">
                      {{ row.quantity }}
                    </td>
                    <td class="px-3 py-2 text-right font-semibold text-surfaceDark">
                      Rp {{ formatCurrency(rowSubtotal(row)) }}
                    </td>
                  </tr>
                  <tr v-if="!testRows.length">
                    <td colspan="6" class="px-3 py-4 text-center text-sm text-gray-500">
                      Belum ada data pengujian untuk permintaan ini.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex flex-col items-end gap-1 text-sm text-gray-600">
              <div class="flex items-center justify-end gap-4">
                <span>Total Pengujian</span>
                <span class="font-semibold text-surfaceDark">
                  Rp {{ formatCurrency(grandTotal) }}
                </span>
              </div>
            </div>
          </section>

          <aside class="space-y-4">
            <div class="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-3 text-sm text-gray-600">
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Customer</span>
                <span class="font-semibold text-surfaceDark">
                  {{ customerNameDisplay || '-' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Tanggal Permintaan</span>
                <span class="font-medium">{{ formattedEntryDate }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500">Batas Pembayaran</span>
                <span class="font-semibold text-danger">
                  {{ paymentDeadline.label }}
                </span>
              </div>
            </div>

            <div class="rounded-xl border border-gray-200 p-4 space-y-3 text-sm text-gray-600">
              <h4 class="text-sm font-semibold text-surfaceDark">Instruksi Pembayaran</h4>
              <div
                v-for="(account, idx) in bankAccounts"
                :key="`bank-${idx}`"
                class="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p class="text-xs text-gray-500 uppercase tracking-wide">{{ account.bank }}</p>
                <p class="text-base font-semibold text-surfaceDark">{{ account.number }}</p>
                <p class="text-xs text-gray-500">a.n {{ account.name }}</p>
              </div>
              <div class="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-primaryDark">
                Scan QRIS pada aplikasi perbankan Anda untuk pembayaran cepat.
              </div>
            </div>

            <div class="rounded-xl bg-white border border-gray-200 p-4 space-y-3 text-sm text-gray-600">
              <div class="flex items-center justify-between">
                <span>Total Tagihan</span>
                <span class="font-semibold text-surfaceDark">
                  Rp {{ formatCurrency(grandTotal) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span>Sisa Pembayaran</span>
                <span class="font-semibold" :class="outstanding > 0 ? 'text-danger' : 'text-emerald-600'">
                  Rp {{ formatCurrency(outstanding) }}
                </span>
              </div>
            </div>
          </aside>
        </div>

        <div class="grid gap-4 md:grid-cols-[2fr_1fr]">
          <div>
            <h4 class="text-sm font-semibold text-surfaceDark mb-2">Upload Bukti Pembayaran</h4>
            <p class="text-xs text-gray-500 mb-3">
              Unggah bukti transfer dalam format PDF, PNG, atau JPG (maksimal 5MB).
            </p>
            <FileUpload v-model="transferFiles" />
          </div>
          <div class="rounded-xl border border-gray-200 p-4 text-xs text-gray-600 space-y-2">
            <h4 class="text-sm font-semibold text-surfaceDark">Catatan</h4>
            <p>
              Setelah bukti pembayaran dikirim, tim admin akan melakukan verifikasi maksimal dalam 1x24 jam
              sebelum permintaan diproses lebih lanjut.
            </p>
            <p>
              Bila pembayaran melewati batas waktu, permintaan dapat dibatalkan secara otomatis oleh sistem.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center">
          <button
            class="w-full sm:w-auto rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
            @click="downloadInvoice"
          >
            Unduh Invoice
          </button>
          <button
            class="w-full sm:w-auto rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
            @click="handleClose"
          >
            Tutup
          </button>
          <button
            class="w-full sm:w-auto rounded-md bg-primary text-white px-4 py-2 text-sm font-semibold transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canConfirmPayment"
            @click="savePayment"
          >
            Konfirmasi Pembayaran
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import FileUpload from '@/components/FileUpload.vue';

const props = defineProps({
  tests: { type: Array, default: () => [] },
  orderId: { type: String, default: '' },
  initialRows: { type: Array, default: () => [] },
  customerName: { type: String, default: '' },
  entryDate: { type: String, default: '' },
});

const emit = defineEmits(['close', 'payment-saved']);

const testRows = ref([]);
const transferFiles = ref([]);
const amountPaid = ref(0);

const bankAccounts = [
  { bank: 'Bank Jateng', number: '1234 5678 90', name: 'UPT Lab Tegal' },
  { bank: 'BRI', number: '0099 8877 6655', name: 'UPT Lab Tegal' },
];

const formattedOrderId = computed(() => props.orderId || '-');

const formattedEntryDate = computed(() => formatDate(props.entryDate));

const paymentDeadline = computed(() => {
  const base = props.entryDate ? new Date(props.entryDate) : new Date();
  const deadline = new Date(base.getTime());
  deadline.setDate(deadline.getDate() + 2);
  return {
    label: formatDate(deadline.toISOString()),
    iso: deadline.toISOString(),
  };
});

watch(
  () => props.initialRows,
  (rows) => {
    applyInitialRows(Array.isArray(rows) ? rows : []);
  },
  { immediate: true, deep: true },
);

function applyInitialRows(rows = []) {
  const prepared = rows.map((row) => normalizeRow(row));
  testRows.value = prepared;
  transferFiles.value = [];
  amountPaid.value = prepared.reduce((sum, row) => sum + rowSubtotal(row), 0);
}

function normalizeRow(row = {}) {
  const test = findTest(row.testId);
  const quantity = Math.max(1, Number(row.quantity) || 1);
  const price = Math.max(0, Number(row.price ?? test?.price ?? 0));
  const testName =
    row.testName ||
    test?.name ||
    test?.testCategory ||
    'Pengujian';
  return {
    testId: row.testId || test?.id || null,
    testName,
    objectName: row.objectName || row.testName || test?.testCategory || '',
    price,
    quantity,
  };
}

function findTest(id) {
  if (!id) return null;
  return props.tests?.find((test) => test.id === id) || null;
}

function rowSubtotal(row) {
  return Math.max(0, Number(row.price) || 0) * Math.max(1, Number(row.quantity) || 1);
}

const grandTotal = computed(() =>
  testRows.value.reduce((sum, row) => sum + rowSubtotal(row), 0),
);

const outstanding = computed(() =>
  Math.max(0, grandTotal.value - Math.max(0, Number(amountPaid.value) || 0)),
);

const customerNameDisplay = computed(() => props.customerName);

const canConfirmPayment = computed(() => {
  return amountPaid.value > 0 && transferFiles.value.length > 0;
});

function normalizeAmount() {
  amountPaid.value = Math.max(0, Number(amountPaid.value) || 0);
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function savePayment() {
  normalizeAmount();
  const detail = {
    orderId: props.orderId,
    status: 'payment_received',
    total: grandTotal.value,
    amountPaid: amountPaid.value,
    outstanding: outstanding.value,
    paymentDeadline: paymentDeadline.value.iso,
    paymentDate: new Date().toISOString(),
    testRows: testRows.value.map((row) => ({ ...row })),
    transferFiles: transferFiles.value,
  };
  emit('payment-saved', detail);
  handleClose();
}

function downloadInvoice() {
  alert('Fitur unduh invoice akan tersedia setelah integrasi dokumen.');
}

function handleClose() {
  emit('close');
}
</script>
