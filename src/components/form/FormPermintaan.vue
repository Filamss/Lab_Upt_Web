<template>
  <div class="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
    <h3 class="text-lg font-semibold mb-4">
      {{ isEdit ? 'Edit Permintaan' : 'Tambah Permintaan' }}
    </h3>

    <form
      @submit.prevent="handleSubmit"
      class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
    >
      <!-- ID Order -->
      <div>
        <label class="block text-sm font-medium mb-1">ID Order</label>
        <input
          v-model="form.idOrder"
          type="text"
          readonly
          class="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-100 text-gray-600"
          placeholder="Akan diisi otomatis setelah permintaan disimpan"
        />
      </div>

      <!-- Nomor Order (otomatis dari backend) -->
      <div>
        <label class="block text-sm font-medium mb-1">No. Order</label>
        <input
          :value="orderNumberDisplay"
          type="text"
          readonly
          class="border border-gray-300 rounded-md px-3 py-2 w-full bg-gray-100 text-gray-600"
          placeholder="Belum tersedia"
        />
        <p class="mt-1 text-xs text-gray-500">
          Nomor akan terisi otomatis saat data disimpan dan tidak dapat diubah.
        </p>
      </div>

      <!-- Tanggal Masuk -->
      <div>
        <label class="block text-sm font-medium mb-1">Tanggal Masuk</label>
        <input
          v-model="form.entryDate"
          type="date"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        />
      </div>

      <!-- Nama Customer -->
      <div>
        <label class="block text-sm font-medium mb-1">Nama Customer</label>
        <input
          v-model="form.customerName"
          type="text"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="Nama Customer"
        />
      </div>

      <!-- No Telepon -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">No Telepon</label>
        <input
          v-model="form.phoneNumber"
          type="text"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="No Telepon"
        />
      </div>

      <!-- Alamat -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Alamat</label>
        <textarea
          v-model="form.address"
          rows="2"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="Alamat lengkap"
        ></textarea>
      </div>

      <!-- Jenis Pengujian -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Jenis Pengujian</label>
        <div v-if="testOptions.length" class="space-y-3">
          <div v-if="!form.testItems.length" class="text-sm text-gray-500">
            Belum ada pengujian yang dipilih.
          </div>
          <div
            v-for="(item, index) in form.testItems"
            :key="`test-${index}`"
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3"
          >
            <div
              class="grid gap-3 md:grid-cols-[5fr_3fr_2fr_2fr_2fr_auto] md:items-end"
            >
              <div class="flex flex-col gap-1">
                <label class="block text-xs font-semibold text-gray-600">
                  Cari Pengujian
                </label>
                <input
                  :list="`test-search-${index}`"
                  v-model="item.selectedLabel"
                  @change="handleTestSelection(index)"
                  @blur="handleTestBlur(index)"
                  type="text"
                  class="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
                  placeholder="Ketik minimal 3 huruf untuk mencari pengujian..."
                />
                <datalist :id="`test-search-${index}`">
                  <option
                    v-for="opt in testOptions"
                    :key="opt.value"
                    :value="opt.label"
                  />
                </datalist>
              </div>
              <div class="flex flex-col gap-1">
                <label class="block text-xs font-semibold text-gray-600">
                  Nama Objek Uji
                </label>
                <input
                  v-model="item.objectName"
                  type="text"
                  class="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
                  placeholder="cth. Beton Kolom A"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="block text-xs font-semibold text-gray-600">
                  Tarif (Rp)
                </label>
                <input
                  v-model="item.price"
                  type="text"
                  readonly
                  class="border border-gray-300 rounded-md px-3 py-2 w-full text-sm text-right bg-gray-50"
                  placeholder="0"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="block text-xs font-semibold text-gray-600">
                  Satuan
                </label>
                <input
                  v-model="item.unit"
                  type="text"
                  readonly
                  class="border border-gray-300 rounded-md px-3 py-2 w-full text-sm bg-gray-50"
                  placeholder="-"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="block text-xs font-semibold text-gray-600">
                  Jumlah Sampel
                </label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="border border-gray-300 rounded-md px-3 py-2 w-full text-sm text-right"
                  placeholder="1"
                />
              </div>
              <div class="flex items-end justify-end">
                <button
                  type="button"
                  class="px-3 py-2 rounded-md border text-danger hover:bg-red-50 text-sm"
                  @click="removeTestItem(index)"
                >
                  Hapus
                </button>
              </div>
            </div>
            <div
              class="flex flex-col gap-2 border-t border-dashed pt-3 text-xs"
            >
              <span class="text-gray-500">
                Pilih pengujian yang sesuai dari daftar pencarian untuk mengisi
                data secara otomatis.
              </span>
              <div
                class="flex flex-wrap items-center justify-between text-gray-600"
              >
                <span>
                  Subtotal:
                  <span class="font-semibold text-primaryDark"
                    >Rp {{ formatCurrency(itemSubtotal(item)) }}</span
                  >
                </span>
                <span v-if="!item.testId" class="text-danger">
                  Pengujian belum dipilih.
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="px-3 py-2 rounded-md border border-dashed text-sm text-primary hover:bg-primary/5"
            @click="addTestItem"
          >
            + Tambah Jenis Pengujian
          </button>
        </div>
        <div v-else class="text-sm text-gray-500">
          Data pengujian belum tersedia. Silakan tambah pengujian di halaman
          layanan terlebih dahulu.
        </div>
      </div>

      <!-- Paket Pekerjaan -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Paket Pekerjaan</label>
        <input
          v-model="form.workPackage"
          type="text"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
          placeholder="cth.Proyek pembangunan gedung"
        />
      </div>

      <!-- Jenis Pekerjaan -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-1">Jenis Pekerjaan</label>
        <select
          v-model="form.jobCategory"
          class="border border-gray-300 rounded-md px-3 py-2 w-full"
        >
          <option disabled value="">Pilih kategori</option>
          <option>Pendidikan</option>
          <option>IKM</option>
          <option>Kontraktor</option>
          <option>Internal</option>
          <option>Lainnya</option>
        </select>
      </div>

      <!-- Tombol -->
      <div
        class="md:col-span-2 mt-6 flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end sm:items-center sm:gap-3"
      >
        <button
          type="button"
          class="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition"
          @click="$emit('cancel')"
        >
          Batal
        </button>
        <button
          type="button"
          class="w-full sm:w-auto px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primaryDark transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSave"
          @click="submitWith('save')"
        >
          {{ isEdit ? 'Simpan Perubahan' : 'Simpan' }}
        </button>
        <button
          type="button"
          class="w-full sm:w-auto px-4 py-2 rounded-md bg-success text-white text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSaveAndPay"
          @click="submitWith('save-pay')"
        >
          Simpan &amp; Bayar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useTestStore } from '@/stores/useTestStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';

const props = defineProps({
  modelValue: Object,
  isEdit: Boolean,
});

const emit = defineEmits(['submit', 'cancel']);
const openConfirm = useConfirmDialog();

const testStore = useTestStore();
const currentYear = new Date().getFullYear();
const isEditMode = computed(() => props.isEdit);

const testOptions = computed(() =>
  (testStore.tests || []).map((test) => {
    const segments = [
      test.name || test.testCategory || null,
      test.code || null,
    ].filter(Boolean);
    const label =
      segments.length > 0
        ? segments.join(' - ')
        : test.name || test.testCategory || 'Pengujian';
    return {
      value: test.id,
      label,
      price: Number(test.price ?? 0),
      unit: test.unit || '',
      code: test.code || '',
    };
  })
);

onMounted(() => {
  if (!testStore.tests.length && !testStore.loading) {
    testStore.fetchAll();
  }
});

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function extractYear(dateStr) {
  if (!dateStr) return String(currentYear);
  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) {
    return String(parsed.getFullYear());
  }
  const match = /^(\d{4})/.exec(dateStr);
  return match ? match[1] : String(currentYear);
}

const defaultForm = () => {
  const entryDate = todayString();
  const orderYear = extractYear(entryDate);
  return {
    idOrder: '',
    orderNumber: null,
    orderYear,
    entryDate,
    customerName: '',
    phoneNumber: '',
    address: '',
    purpose: '',
    testCategory: '',
    jobCategory: '',
    workPackage: '',
    testItems: [],
    status: 'draft',
  };
};

const form = ref(defaultForm());

const orderNumberDisplay = computed(() => {
  const number = form.value.orderNumber;
  if (number === null || number === undefined || number === '') {
    return '-';
  }
  return String(number);
});

function updateOrderMetadata(entryDate) {
  const year = extractYear(entryDate);
  form.value.orderYear = year;
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      const inheritedYear = extractYear(val.entryDate || todayString());
      form.value = {
        ...defaultForm(),
        ...val,
        orderYear: val.orderYear || inheritedYear,
        orderNumber: val.orderNumber ?? null,
        testItems: (val.testItems || []).map((item) => ({
          testId: item.testId || '',
          selectedLabel: item.testName || resolveTestName(item.testId) || '',
          quantity: item.quantity ?? 1,
          objectName: item.objectName || '',
          price:
            item.price !== undefined && item.price !== null
              ? String(item.price)
              : '',
          unit: item.unit || resolveTestUnit(item.testId) || '',
          testCode: item.testCode || resolveTestCode(item.testId) || '',
          manualPrice: Boolean(item.manualPrice),
        })),
      };
    } else {
      form.value = defaultForm();
    }
    updateOrderMetadata(form.value.entryDate);
  },
  { immediate: true }
);

watch(
  () => testOptions.value.length,
  (len) => {
    if (len && !isEditMode.value && form.value.testItems.length === 0) {
      addTestItem();
    }
  },
  { immediate: true }
);

function addTestItem() {
  form.value.testItems.push({
    testId: '',
    selectedLabel: '',
    quantity: 1,
    objectName: '',
    price: '',
    unit: '',
    testCode: '',
    manualPrice: false,
  });
}

function removeTestItem(index) {
  form.value.testItems.splice(index, 1);
}

function resolveTestName(testId) {
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : (testStore.tests || []).find((t) => t.id === testId);
  if (!test) return 'Pengujian';
  return (
    test.name ||
    test.testCategory ||
    [test.category, test.code].filter(Boolean).join(' - ') ||
    test.code ||
    'Pengujian'
  );
}

function resolveTestUnit(testId) {
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : (testStore.tests || []).find((t) => t.id === testId);
  return test?.unit || '';
}

function resolveTestCode(testId) {
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : (testStore.tests || []).find((t) => t.id === testId);
  return test?.code || '';
}

function handleTestSelection(index) {
  const item = form.value.testItems[index];
  if (!item) return;
  const label = (item.selectedLabel || '').trim();
  const option = testOptions.value.find(
    (opt) => opt.label.toLowerCase() === label.toLowerCase()
  );
  if (!option) {
    item.testId = '';
    item.price = '';
    item.unit = '';
    item.manualPrice = false;
    return;
  }
  item.price = '';
  item.unit = '';
  item.manualPrice = false;
  applyOptionToItem(item, option);
}

function handleTestBlur(index) {
  const item = form.value.testItems[index];
  if (!item) return;
  if (!item.testId) {
    handleTestSelection(index);
  }
}

function applyOptionToItem(item, option) {
  item.testId = option.value;
  item.selectedLabel = option.label;
  if (
    !item.manualPrice &&
    option.price !== undefined &&
    option.price !== null
  ) {
    item.price = String(option.price);
  }
  item.unit = option.unit || resolveTestUnit(option.value) || '';
  item.testCode = option.code || resolveTestCode(option.value) || '';
}

watch(
  testOptions,
  () => {
    form.value.testItems.forEach((item) => {
      if (!item.testId) return;
      const option = testOptions.value.find((opt) => opt.value === item.testId);
      if (option) applyOptionToItem(item, option);
      else if (!item.unit) item.unit = resolveTestUnit(item.testId) || '';
    });
  },
  { deep: true }
);

watch(
  () => form.value.testItems,
  (items) => {
    items.forEach((item) => {
      item.quantity = Math.max(1, Number(item.quantity) || 1);
      if (item.testId && !item.selectedLabel) {
        item.selectedLabel = resolveTestName(item.testId);
      }
      if (item.testId && !item.testCode) {
        item.testCode = resolveTestCode(item.testId);
      }
    });
  },
  { deep: true }
);

watch(
  () => form.value.entryDate,
  (newDate) => {
    if (!newDate) return;
    updateOrderMetadata(newDate);
  }
);

const normalizedTestItems = computed(() =>
  form.value.testItems
    .filter((item) => item.testId)
    .map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.price) || 0);
      const testName = resolveTestName(item.testId);
      const testCode = item.testCode || resolveTestCode(item.testId) || '';
      return {
        testId: item.testId,
        testName,
        testCode,
        objectName: item.objectName?.trim() || testName,
        price,
        quantity,
        unit: item.unit || resolveTestUnit(item.testId) || '',
      };
    })
);

const canSave = computed(() => {
  const hasCustomer = Boolean(
    form.value.customerName && form.value.customerName.trim()
  );
  const hasEntryDate = Boolean(form.value.entryDate);
  return hasCustomer && hasEntryDate && normalizedTestItems.value.length > 0;
});

const canSaveAndPay = computed(() => {
  return (
    canSave.value && normalizedTestItems.value.every((item) => item.price > 0)
  );
});

function itemSubtotal(item) {
  return (
    Math.max(0, Number(item.price) || 0) *
    Math.max(1, Number(item.quantity) || 1)
  );
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function buildPayload() {
  const testItems = normalizedTestItems.value;
  const summary = testItems.length
    ? testItems.map((item) => `${item.testName} (${item.quantity})`).join(', ')
    : form.value.testCategory || form.value.purpose || '';

  const {
    idOrder,
    orderNumber,
    orderYear,
    entryDate,
    customerName,
    phoneNumber,
    address,
    jobCategory,
    workPackage,
    status,
  } = form.value;

  return {
    idOrder,
    orderNumber: orderNumber ? Number(orderNumber) : null,
    orderYear: orderYear || extractYear(entryDate),
    entryDate,
    customerName,
    phoneNumber,
    address,
    jobCategory,
    workPackage,
    status: status || 'draft',
    purpose: summary,
    testCategory: summary,
    testItems,
  };
}

async function submitWith(action = 'save') {
  if (action === 'save-pay' && !canSaveAndPay.value) return;
  if (action !== 'save-pay' && !canSave.value) return;
  const confirmed = await openConfirm({
    title:
      action === 'save-pay'
        ? 'Simpan & lanjutkan pembayaran?'
        : isEditMode.value
        ? 'Simpan perubahan permintaan?'
        : 'Simpan permintaan baru?',
    message:
      action === 'save-pay'
        ? 'Data permintaan akan disimpan dan Anda akan diarahkan ke form pembayaran.'
        : 'Pastikan informasi permintaan sudah lengkap sebelum melanjutkan.',
    confirmLabel: action === 'save-pay' ? 'Simpan & Bayar' : 'Simpan',
  });
  if (!confirmed) return;
  const payload = buildPayload();
  if (action === 'save-pay') {
    payload.status = 'pending_payment';
  } else if (!isEditMode.value) {
    payload.status = payload.status || 'draft';
  }
  emit('submit', { action, data: payload });
}

function handleSubmit() {
  submitWith('save');
}
</script>

