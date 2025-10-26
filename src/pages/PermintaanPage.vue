<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-lg font-semibold text-surfaceDark sm:text-2xl">
        Daftar Permintaan Pengujian
      </h2>
      <button
        class="w-full rounded-lg bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-center text-white shadow-sm transition hover:opacity-90 sm:w-auto"
        @click="openAddModal"
      >
        Tambah Permintaan
      </button>
    </div>

    <!-- Datatable -->
    <div class="rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:p-4">
      <div class="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 class="text-base font-semibold text-surfaceDark sm:text-lg"></h3>
        <!-- Tombol hapus massal -->
        <button
          v-if="selectedRows.length"
          @click="deleteSelected"
          class="w-full rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600 sm:w-auto"
        >
          Hapus Terpilih ({{ selectedRows.length }})
        </button>
      </div>

      <div class="overflow-x-auto">
        <DataTable
          :columns="columns"
          :rows="store.requestList"
          :page-size="10"
          searchable
          filterable
          selectable
          mobile-mode="table"
          scroll-body-on-mobile
          body-scroll-height="55vh"
          @update:selected="selectedRows = $event"
        >
        <template #idOrder="{ value }">
          <span class="block text-sm text-gray-700 break-all">
            {{ value || '-' }}
          </span>
        </template>
        <template #testItems="{ value, row }">
          <div class="text-left">
            <template v-if="value?.length">
              <span
                v-for="(item, idx) in value"
                :key="`${row.idOrder}-test-${idx}`"
                class="block text-xs text-gray-700"
              >
                {{ item.testName || resolveTestName(item) }}
                <span class="text-gray-500">({{ item.quantity }})</span>
              </span>
            </template>
            <span v-else class="text-xs text-gray-400">
              {{ row.testCategory || '-' }}
            </span>
          </div>
        </template>

        <template #status="{ value }">
          <div class="max-w-[140px] w-full">
            <Badge :status="value" />
          </div>
        </template>
        
        <template #actions="{ row }">
          <div class="flex gap-2 justify-center">
            <button
              class="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 hover:text-blue-800"
              @click="openEditModal(row)"
            >
              <PencilIcon class="w-5 h-5" />
            </button>
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-red-600 hover:text-red-800"
              @click="deleteRequest(row)"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </template>
      </DataTable>
      </div>
    </div>

    <!-- Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-2"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-[98vw] max-w-5xl max-h-[90vh] overflow-y-auto relative"
        >
          <button
            @click="closeModal"
            class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          <FormPermintaan
            :model-value="selectedRequest"
            :is-edit="isEdit"
            @submit="handleFormSubmit"
            @cancel="closeModal"
          />
        </div>
      </div>
    </transition>

    <FormPayment
      v-if="showPaymentModal"
      :tests="testStore.tests"
      :order-id="paymentContext?.orderId ?? ''"
      :initial-rows="paymentContext?.rows ?? []"
      :customer-name="paymentContext?.customerName ?? ''"
      :entry-date="paymentContext?.entryDate ?? ''"
      @close="closePaymentModal"
      @payment-saved="handlePaymentSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePermintaanStore } from '@/stores/usePermintaanStore';
import { useTestStore } from '@/stores/useTestStore';
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import FormPermintaan from '@/components/form/FormPermintaan.vue';
import FormPayment from '@/components/form/FormPayment.vue';
import Badge from '@/components/Badge.vue';
import DataTable from '../components/DataTable.vue';
import { useConfirmDialog } from '@/stores/useConfirmDialog';

const store = usePermintaanStore();
const testStore = useTestStore();
const search = ref('');
const statusFilter = ref('');
const showModal = ref(false);
const showPaymentModal = ref(false);
const isEdit = ref(false);
const selectedRequest = ref(null);
const selectedRows = ref([]);
const paymentContext = ref(null);
const openConfirm = useConfirmDialog();

onMounted(() => {
  store.fetchAll();
  if (!testStore.tests.length) {
    testStore.fetchAll();
  }
});

// === DataTable columns ===
const columns = [
  // Kolom utama tetap tampak
  {
    field: 'idOrder',
    title: 'ID Order',
    className: 'max-w-[180px] min-w-[140px] pr-4',
    slotName: 'idOrder',
  },
  { field: 'entryDate', title: 'Tanggal Masuk' },
  {
    field: 'status',
    title: 'Status',
    className: 'min-w-[110px] max-w-[140px] text-left',
  },

  // Tampil mulai SM
  {
    field: 'customerName',
    title: 'Pelanggan',
    className: 'hidden sm:table-cell',
  },

  {
    field: 'phoneNumber',
    title: 'No. Telepon',
    className: 'hidden md:table-cell',
  },

  {
    field: 'testItems',
    title: 'Jenis Pengujian',
    className: 'hidden lg:table-cell text-left',
  },

  // Aksi: selalu tampil, jangan mengecil
  {
    field: 'actions',
    title: 'Aksi',
    className: 'shrink-0 w-24',
    sortable: false,
  },
];

// ✅ Data Filtered
const filteredRequests = computed(() => {
  return store.requestList.filter((r) => {
    const matchSearch = r.idOrder
      ?.toLowerCase()
      .includes(search.value.toLowerCase());
    const matchStatus = statusFilter.value
      ? r.status === statusFilter.value
      : true;
    return matchSearch && matchStatus;
  });
});

// === Modal logic ===
function openAddModal() {
  isEdit.value = false;
  selectedRequest.value = {
    idOrder: '',
    entryDate: new Date().toISOString().substring(0, 10),
    customerName: '',
    phoneNumber: '',
    address: '',
    testCategory: '',
    jobCategory: '',
    workPackage: '',
    testItems: [],
    status: 'draft',
  };

  showModal.value = true;
}

function openEditModal(item) {
  isEdit.value = true;
  selectedRequest.value = {
    ...item,
    testItems: (item.testItems || []).map((detail) => ({
      testId: detail.testId || '',
      testName: detail.testName || '',
      quantity: detail.quantity ?? 1,
      objectName: detail.objectName || detail.testName || '',
      price: Number(detail.price ?? 0),
    })),
  };
  showModal.value = true;
}

function buildPaymentRows(items = []) {
  return (items || []).map((item) => {
    const test =
      typeof testStore.getTestById === 'function'
        ? testStore.getTestById(item.testId)
        : (testStore.tests || []).find((t) => t.id === item.testId);
    return {
      testId: item.testId || test?.id || null,
      testName: item.testName || test?.name || test?.testCategory || '',
      objectName:
        item.objectName ||
        item.testName ||
        test?.testCategory ||
        test?.name ||
        '',
      quantity: item.quantity ?? 1,
      price: Number(item.price ?? test?.price ?? 0),
    };
  });
}

async function handleFormSubmit(payload) {
  const action = payload?.action || 'save';
  const data = payload?.data || {};
  let savedData = null;

  if (isEdit.value) {
    await store.updateRequest(data.idOrder, data);
    savedData =
      store.requestList.find((req) => req.idOrder === data.idOrder) || data;
  } else {
    const { data: created } = await store.addRequest(data);
    savedData = created || data;
  }

  showModal.value = false;
  selectedRequest.value = null;

  if (savedData && action === 'save-pay') {
    paymentContext.value = {
      orderId: savedData.idOrder,
      customerName: savedData.customerName,
      entryDate: savedData.entryDate,
      rows: buildPaymentRows(savedData.testItems),
    };
    showPaymentModal.value = true;
  }

  isEdit.value = false;
}

function closePaymentModal() {
  showPaymentModal.value = false;
  paymentContext.value = null;
}

function closeModal() {
  showModal.value = false;
  selectedRequest.value = null;
  isEdit.value = false;
}

async function deleteRequest(item) {
  const ok = await openConfirm({
    title: 'Hapus permintaan?',
    message: `Permintaan ${item.idOrder} akan dihapus permanen.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!ok) return;
  await store.deleteRequest(item.idOrder);
}

async function deleteSelected() {
  if (!selectedRows.value.length) return;
  const ok = await openConfirm({
    title: 'Hapus permintaan terpilih?',
    message: `${selectedRows.value.length} permintaan akan dihapus permanen.`,
    confirmLabel: 'Hapus Semua',
    variant: 'danger',
  });
  if (!ok) return;
  for (const row of selectedRows.value) {
    await store.deleteRequest(row.idOrder);
  }
  selectedRows.value = [];
}

function resolveTestName(detail) {
  if (!detail) return '-';
  if (detail.testName) return detail.testName;
  const testId = detail.testId;
  if (!testId) return '-';
  const test =
    typeof testStore.getTestById === 'function'
      ? testStore.getTestById(testId)
      : testStore.tests.find((t) => t.id === testId);
  return (
    test?.name ||
    test?.testCategory ||
    [test?.category, test?.code].filter(Boolean).join(' - ') ||
    test?.code ||
    testId
  );
}

async function handlePaymentSaved(detail) {
  await store.updateRequest(detail.orderId, {
    status: detail.status || 'payment_received',
    paymentInfo: detail,
  });
  closePaymentModal();
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
