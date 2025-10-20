<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-surfaceDark">
        Daftar Permintaan Pengujian
      </h2>
      <button
        class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-4 py-2 rounded-lg"
        @click="openAddModal"
      >
        Tambah Permintaan
      </button>
    </div>

    <!-- Datatable -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-md p-4">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-lg font-semibold text-surfaceDark"></h3>
        <!-- Tombol hapus massal -->
        <button
          v-if="selectedRows.length"
          @click="deleteSelected"
          class="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm"
        >
          Hapus Terpilih ({{ selectedRows.length }})
        </button>
      </div>

      <DataTable
        :columns="columns"
        :rows="store.requestList"
        :page-size="8"
        searchable
        filterable
        selectable
        @update:selected="selectedRows = $event"
      >
        <template #status="{ value }">
          <Badge :status="value" />
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

    <!-- Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      >
        <div
          class="bg-white rounded-xl shadow-lg w-[95%] md:w-[600px] relative overflow-hidden"
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
            @submit="saveRequest"
            @cancel="closeModal"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePermintaanStore } from '@/stores/usePermintaanStore';
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import FormPermintaan from '@/components/form/FormPermintaan.vue';
import Badge from '@/components/Badge.vue';
import DataTable from '../components/DataTable.vue';

const store = usePermintaanStore();
const search = ref('');
const statusFilter = ref('');
const showModal = ref(false);
const isEdit = ref(false);
const selectedRequest = ref(null);
const selectedRows = ref([]);

onMounted(() => {
  store.fetchAll();
});

// === DataTable columns ===
const columns = [
  // Kolom utama tetap tampak
  { field: 'idOrder',     title: 'ID Order',       className: 'sticky left-0 z-20' },
  { field: 'entryDate',   title: 'Tanggal Masuk' },
  { field: 'status',      title: 'Status' },

  // Tampil mulai SM
  { field: 'customerName', title: 'Pelanggan',     className: 'hidden sm:table-cell' },

  // Tampil mulai MD
  { field: 'jobCategory', title: 'Kategori',       className: 'hidden md:table-cell' },
  { field: 'phoneNumber', title: 'No. Telepon',    className: 'hidden md:table-cell' },

  // Tampil mulai LG (panjang)
  { field: 'address',     title: 'Alamat',         className: 'hidden lg:table-cell' },
  { field: 'purpose',     title: 'Keperluan',      className: 'hidden lg:table-cell' },

  // Aksi: selalu tampil, jangan mengecil
  { field: 'actions',     title: 'Aksi',           className: 'shrink-0 w-24' },
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
    purpose: '', 
    jobCategory: '',
    status: 'new',
  };

  showModal.value = true;
}

function openEditModal(item) {
  isEdit.value = true;
  selectedRequest.value = { ...item };
  showModal.value = true;
}

async function saveRequest(data) {
  if (isEdit.value) {
    await store.updateRequest(data.idOrder, data);
  } else {
    await store.addRequest(data);
  }
  showModal.value = false;
}

function closeModal() {
  showModal.value = false;
}

async function deleteRequest(item) {
  if (confirm(`Hapus permintaan ${item.idOrder}?`)) {
    await store.deleteRequest(item.idOrder);
  }
}

async function deleteSelected() {
  if (!selectedRows.value.length) return;
  if (confirm(`Hapus ${selectedRows.value.length} permintaan terpilih?`)) {
    for (const row of selectedRows.value) {
      await store.deleteRequest(row.idOrder);
    }
    selectedRows.value = [];
  }
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
