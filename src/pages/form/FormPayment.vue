<template>
  <!-- Overlay for modal -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    @click.self="handleClose"
  >
    <div
      class="bg-white rounded-xl shadow-xl p-6 max-w-6xl w-full overflow-y-auto"
    >
      <h3 class="text-lg font-semibold mb-4">Permintaan Uji & Pembayaran</h3>
      <!-- Table of tests -->
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm border border-gray-200">
          <thead class="bg-muted">
            <tr>
              <th class="border-b px-2 py-2">No</th>
              <th class="border-b px-2 py-2">Nama Pengujian</th>
              <th class="border-b px-2 py-2">Nama Objek Uji</th>
              <th class="border-b px-2 py-2">Biaya Satuan (Rp)</th>
              <th class="border-b px-2 py-2">Jumlah Sampel</th>
              <th class="border-b px-2 py-2">Subtotal</th>
              <th class="border-b px-2 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in testRows"
              :key="index"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="px-2 py-2 border-b text-center">{{ index + 1 }}</td>
              <td class="px-2 py-2 border-b">
                <select
                  v-model="row.testId"
                  class="border border-gray-300 rounded-md px-2 py-1 w-full"
                >
                  <option :value="null">Pilih</option>
                  <option v-for="t in tests" :key="t.id" :value="t.id">
                    {{ t.name }}
                  </option>
                </select>
              </td>
              <td class="px-2 py-2 border-b">
                <input
                  type="text"
                  v-model="row.objectName"
                  placeholder="Nama Objek Uji"
                  class="border border-gray-300 rounded-md px-2 py-1 w-full"
                />
              </td>
              <td class="px-2 py-2 border-b">
                <input
                  type="number"
                  min="0"
                  v-model.number="row.price"
                  class="border border-gray-300 rounded-md px-2 py-1 w-full text-right"
                />
              </td>
              <td class="px-2 py-2 border-b">
                <input
                  type="number"
                  min="1"
                  v-model.number="row.quantity"
                  class="border border-gray-300 rounded-md px-2 py-1 w-full text-right"
                />
              </td>
              <td class="px-2 py-2 border-b text-right">
                Rp {{ formatCurrency(rowSubtotal(row)) }}
              </td>
              <td class="px-2 py-2 border-b text-center">
                <button
                  class="text-danger text-sm hover:underline"
                  @click="removeRow(index)"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        class="mt-2 bg-primary text-white px-3 py-1 rounded text-sm"
        @click="addRow"
      >
        Tambah Baris
      </button>

      <!-- Payment summary -->
      <div class="mt-6 space-y-2 text-sm">
        <div class="flex justify-between">
          <span>Total</span>
          <span>Rp {{ formatCurrency(total) }}</span>
        </div>
        <div class="flex justify-between font-semibold">
          <span>Grand Total</span>
          <span>Rp {{ formatCurrency(grandTotal) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span>Uang Muka</span>
          <input
            type="number"
            min="0"
            v-model.number="dp"
            class="border border-gray-300 rounded-md px-2 py-1 w-32 text-right"
          />
        </div>
        <div class="flex justify-between font-semibold">
          <span>Kembalian</span>
          <span>Rp {{ formatCurrency(change) }}</span>
        </div>
      </div>

      <!-- File upload for transfer proof -->
      <div class="mt-6">
        <h4 class="font-medium mb-2">Bukti Transfer</h4>
        <FileUpload v-model="transferFiles" />
      </div>

      <!-- Action buttons -->
      <div class="mt-6 flex gap-4">
        <button
          class="bg-primary text-white px-3 py-2 rounded"
          @click="printSlip"
        >
          Cetak Slip Invoice
        </button>
        <button
          class="bg-success text-white px-3 py-2 rounded"
          @click="savePayment"
        >
          Simpan
        </button>
        <button
          class="bg-danger text-white px-3 py-2 rounded"
          @click="handleClose"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// FormPayment: displays a pop‑up for entering payment details including test
// items, costs, down payment, and uploading proof of transfer.  Emits
// events when the user saves or closes the modal.
import { ref, reactive, computed } from 'vue';
import FileUpload from '@/components/FileUpload.vue';

const props = defineProps({
  // List or computed array of available tests; used in the test selection
  tests: { type: [Array, Object], required: true },
  // ID of the order being processed.  This can be used to update the order
  // store when saving the payment.
  orderId: { type: Number, required: true },
});

const emit = defineEmits(['close', 'payment-saved']);

// Rows representing individual test entries.  Each row allows selection
// of a test, entering an object name, unit price, and quantity.  The
// subtotal is computed on the fly.
const testRows = reactive([
  { testId: null, objectName: '', price: 0, quantity: 1 },
]);

function addRow() {
  testRows.push({ testId: null, objectName: '', price: 0, quantity: 1 });
}
function removeRow(index) {
  testRows.splice(index, 1);
}

function rowSubtotal(row) {
  return (Number(row.price) || 0) * (Number(row.quantity) || 0);
}

const total = computed(() => testRows.reduce((sum, row) => sum + rowSubtotal(row), 0));
const grandTotal = computed(() => total.value);

const dp = ref(0);
const change = computed(() => Math.max(dp.value - grandTotal.value, 0));

const transferFiles = ref([]);

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function savePayment() {
  // Emit details back to the parent.  Parent can update the order store.
  emit('payment-saved', {
    orderId: props.orderId,
    total: total.value,
    downPayment: dp.value,
    remaining: grandTotal.value - dp.value,
    testRows: JSON.parse(JSON.stringify(testRows)),
    transferFiles: transferFiles.value,
  });
  handleClose();
}

function printSlip() {
  // Placeholder for printing invoice.  In a real application, this would
  // generate and open a printable invoice.  For now, show a dummy alert.
  alert('Cetak slip invoice (dummy)');
}

function handleClose() {
  emit('close');
}
</script>