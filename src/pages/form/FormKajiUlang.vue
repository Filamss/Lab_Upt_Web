<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Form Kaji Ulang</h2>
      <button class="text-gray-600 hover:text-gray-900" @click="handleClose">
        &larr; Kembali
      </button>
    </div>

    <!-- === FORM INPUT === -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormRow label="No Order">
          <input
            type="text"
            v-model="form.orderNo"
            class="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-100"
            readonly
          />
        </FormRow>
        <FormRow label="No Sampel">
          <input
            type="text"
            v-model="form.sampleNo"
            class="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </FormRow>
        <FormRow label="Tanggal">
          <input
            type="date"
            v-model="form.date"
            class="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </FormRow>
        <FormRow label="Jenis Pengujian">
          <select
            v-model="form.testType"
            class="border border-gray-300 rounded-md px-3 py-2 w-full"
          >
            <option :value="null">Pilih jenis pengujian</option>
            <option v-for="test in tests" :key="test.id" :value="test.id">
              {{ test.name }}
            </option>
          </select>
        </FormRow>
        <FormRow label="Nama Customer">
          <input
            type="text"
            v-model="form.customerName"
            class="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </FormRow>
        <FormRow label="No Handphone/WhatsApp">
          <input
            type="text"
            v-model="form.customerNo"
            class="border border-gray-300 rounded-md px-3 py-2 w-full"
          />
        </FormRow>
        <div class="sm:col-span-2">
          <FormRow label="Alamat">
            <input
              type="text"
              v-model="form.address"
              class="border border-gray-300 rounded-md px-3 py-2 w-full"
            />
          </FormRow>
        </div>
      </div>
    </div>

    <!-- === EVALUASI === -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Evaluasi</h3>
      <table class="min-w-full text-sm border border-gray-200">
        <thead class="bg-muted">
          <tr>
            <th class="px-3 py-2 border-b">No</th>
            <th class="px-3 py-2 border-b">Perihal</th>
            <th class="px-3 py-2 border-b">Hasil</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in kajiUlangRows"
            :key="index"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="px-3 py-2 border-b text-center">{{ index + 1 }}</td>
            <td class="px-3 py-2 border-b">{{ row.perihal }}</td>
            <td class="px-3 py-2 border-b">
              <select
                v-model="row.hasil"
                class="border border-gray-300 rounded-md px-2 py-1 w-full"
              >
                <option value="">-</option>
                <option
                  v-for="opt in getRowOptions(row.perihal)"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- CATATAN -->
      <div class="mt-4">
        <label class="block text-sm font-medium mb-1">Catatan</label>
        <textarea
          v-model="form.note"
          rows="3"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
        <p class="mt-1 text-xs italic">*) Coret yang tidak perlu</p>
      </div>
    </div>

    <!-- === SIGNATURE NAMES (simple text inputs) === -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-md p-4">
        <h4 class="font-medium mb-2">Customer (nama yang tercetak)</h4>
        <input
          type="text"
          v-model="signatures.customer"
          placeholder="Nama customer (opsional)"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>
      <div class="bg-white rounded-xl shadow-md p-4">
        <h4 class="font-medium mb-2">Administrasi (nama petugas)</h4>
        <input
          type="text"
          v-model="signatures.admin"
          placeholder="Nama administrasi"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>
    </div>

    <!-- === TOMBOL AKSI === -->
    <div class="flex gap-4">
      <button class="bg-primary text-white px-3 py-2 rounded" @click="printNow">
        Cetak
      </button>
      <button
        class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        @click="handleSaveDraft"
      >
        Simpan Draft
      </button>
      <button
        class="bg-success text-white px-4 py-2 rounded-lg"
        @click="handleLolos"
      >
        Lolos Kaji Ulang
      </button>
      <button
        class="bg-danger text-white px-4 py-2 rounded-lg"
        @click="handleTolak"
      >
        Tolak
      </button>
    </div>

    <!-- AREA CETAK (TERSEMBUNYI) -->
    <div ref="printArea" style="display: none">
      <KajiUlangPrint :data="printData" />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import FormRow from '@/components/FormRow.vue';
import KajiUlangPrint from '@/pages/print/KajiUlangPrint.vue';

const props = defineProps({
  form: { type: Object, required: true },
  kajiUlangRows: { type: Array, required: true },
  signatures: { type: Object, required: false },
  tests: { type: [Array, Object], required: true },
  selectedCustomerAddress: { type: String, required: true },
  getRowOptions: { type: Function, required: true },
});

const emit = defineEmits(['save-draft', 'lolos-kaji-ulang', 'tolak', 'close']);

const printArea = ref(null);
const printData = ref({});
const signatures = ref({ customer: props.form.customerName || '', admin: '' });

// === CETAK LANGSUNG TANPA POPUP ===
async function printNow() {
  printData.value = {
    orderNo: props.form.orderNo,
    sampleNo: props.form.sampleNo,
    date: props.form.date,
    customerName: props.form.customerName,
    address: props.form.address,
    testType: props.form.testType,
    note: props.form.note,
    kajiUlangRows: props.kajiUlangRows,
    signatures: [
      {
        label: 'Customer',
        name: signatures.value.customer || props.form.customerName || '',
      },
      { label: 'Administrasi', name: signatures.value.admin || '' },
    ],
  };

  await nextTick();

  // Save data to sessionStorage so the print page can pick it up
  try {
    const key = `print:kaji-ulang:${printData.value.orderNo || 'anon'}`;
    sessionStorage.setItem(key, JSON.stringify(printData.value));

    // Open generic print route in a new tab which will auto-print
    // Also write to window.__PRINT_DATA__ on the opener so the new tab can
    // read the object directly as a fallback (works same-origin).
    try {
      window.__PRINT_DATA__ = printData.value;
    } catch (e) {
      /* ignore */
    }
    const url = `${location.origin}/print/kaji-ulang/${encodeURIComponent(
      printData.value.orderNo || ''
    )}`;
    window.open(url, '_blank', 'noopener');
  } catch (e) {
    // Fallback: if sessionStorage or open fails, still try to call print on current page
    const printEl = printArea.value;
    if (!printEl) return;
    const original = document.body.innerHTML;
    document.body.innerHTML = printEl.innerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  }
}

function handleSaveDraft() {
  emit('save-draft');
}
function handleLolos() {
  emit('lolos-kaji-ulang');
}
function handleTolak() {
  emit('tolak');
}
function handleClose() {
  emit('close');
}
</script>
