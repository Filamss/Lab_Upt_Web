<template>
  <div class="space-y-5">
    <header
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">Layanan & Tarif</h2>
        <p class="text-sm text-gray-500">
          Kelola daftar layanan pengujian, mesin, dan metode agar tim selalu menggunakan referensi terbaru.
        </p>
      </div>
    </header>

    <!-- === DAFTAR LAYANAN === -->
    <div class="bg-white rounded-xl shadow-md p-5">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold text-surfaceDark">Daftar Layanan</h3>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="showModal = true"
          >
            + Tambah Pengujian
          </button>
        </div>
      </div>

      <!-- ✅ DataTable Pengujian -->
      <DataTable
        :columns="testColumns"
        :rows="filteredTests"
        :pageSize="10"
        :filterable="false"
        scroll-body-on-mobile
        body-scroll-height="55vh"
        class="rounded-md"
      >
        <template #price="{ value }">
          Rp {{ value.toLocaleString('id-ID') }}
        </template>

        <template #actions="{ row }">
          <div class="flex justify-left gap-2">
            <button
              class="p-1.5 rounded-md hover:bg-blue-50 text-primary hover:text-primaryDark transition"
              @click="editTest(row)"
            >
              <PencilIcon class="w-5 h-5 inline" />
            </button>
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
              @click="removeTest(row.id)"
            >
              <TrashIcon class="w-5 h-5 inline" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- === MODAL FORM TAMBAH / EDIT === -->
    <FormLayanan
      v-if="showModal"
      :categories="categories"
      :methods="methods"
      :machines="machines"
      :editData="editData"
      @close="showModal = false"
      @save="handleSaveTest"
    />

    <!-- === MESIN UJI === -->
    <div class="bg-white rounded-xl shadow-md p-5 mb-8">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold text-surfaceDark">Mesin Uji</h3>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <input
            v-model="newMachine"
            placeholder="Nama mesin uji"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-64"
          />
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="addMachine"
          >
            Tambah
          </button>
        </div>
      </div>

      <DataTable
        :columns="machineColumns"
        :rows="machineItems"
        :filterable="false"
        scroll-body-on-mobile
        body-scroll-height="40vh"
        class="rounded-md"
      >
        <template #actions="{ row, index }">
          <div class="justify-left">
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
              @click="removeMachine(index)"
            >
              <TrashIcon class="w-5 h-5 inline" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- === METODE UJI === -->
    <div class="bg-white  rounded-xl shadow-md p-5">
      <div
        class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <h3 class="text-lg font-semibold text-surfaceDark">Metode Uji</h3>
        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <input
            v-model="newMethod"
            placeholder="Nama metode uji"
            class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-64"
          />
          <button
            class="w-full rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 sm:w-auto"
            @click="addMethod"
          >
            Tambah
          </button>
        </div>
      </div>

      <DataTable
        :columns="methodColumns"
        :rows="methodItems"
        :filterable="false"
        scroll-body-on-mobile
        body-scroll-height="40vh"
        class="rounded-md"
      >
        <template #actions="{ row, index }">
          <div class="justify-left">
            <button
              class="p-1.5 rounded-md hover:bg-red-50 text-danger hover:text-red-700 transition"
              @click="removeMethod(index)"
            >
              <TrashIcon class="w-5 h-5 inline" />
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useTestStore } from '@/stores/useTestStore';
import FormLayanan from '@/components/form/FormLayanan.vue';
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';
import DataTable from '../components/common/DataTable.vue';

const testStore = useTestStore();

const categories = ['Machining', 'Pengujian'];
const tests = computed(() => testStore.tests);
const machines = computed(() => testStore.machines);
const methods = computed(() => testStore.methods);

const selectedCategory = ref('');
const showModal = ref(false);
const editData = ref(null);

// === Columns ===
const testColumns = [
  { field: 'serviceCategory', title: 'Jenis Layanan', isSortable: true },
  { field: 'code', title: 'Kode', isSortable: true },
  { field: 'testCategory', title: 'Jenis Pengujian', isSortable: true },
  { field: 'unit', title: 'Satuan' },
  { field: 'price', title: 'Tarif', slotName: 'price', isSortable: true },
  { field: 'method', title: 'Metode Uji' },
  { field: 'equipment', title: 'Mesin Uji' },
  { field: 'actions', title: 'Aksi', slotName: 'actions', sortable: false },
];

const machineColumns = [
  {
    field: 'index',
    title: 'No',
    className: 'w-20 text-left',
  },
  { field: 'MachineName', title: 'Nama Mesin' },
  {
    field: 'actions',
    title: 'Aksi',
    className: 'w-20 text-left',
    slotName: 'actions',
    sortable: false,
  },
];

const methodColumns = [
  {
    field: 'index',
    title: 'No',
    className: 'w-20 text-left',
  },
  { field: 'MethodName', title: 'Nama Metode' },
  {
    field: 'actions',
    title: 'Aksi',
    className: 'w-20 text-left',
    slotName: 'actions',
    sortable: false,
  },
];

// === Computed Items ===
const filteredTests = computed(() =>
  selectedCategory.value
    ? tests.value.filter((t) => t.category === selectedCategory.value)
    : tests.value
);

const machineItems = computed(() =>
  machines.value.map((m, i) => ({ index: i + 1, MachineName: m }))
);
const methodItems = computed(() =>
  methods.value.map((m, i) => ({ index: i + 1, MethodName: m }))
);

// === Actions ===
function editTest(test) {
  editData.value = { ...test };
  showModal.value = true;
}

async function handleSaveTest(payload) {
  if (payload.isEdit) await testStore.updateTest(payload);
  else await testStore.addTest(payload);
  showModal.value = false;
  editData.value = null;
}

function removeTest(id) {
  testStore.removeTest(id);
}

// === Mesin ===
const newMachine = ref('');
function addMachine() {
  if (!newMachine.value.trim()) return;
  testStore.addMachine(newMachine.value);
  newMachine.value = '';
}
function removeMachine(idx) {
  testStore.removeMachine(idx);
}

// === Metode ===
const newMethod = ref('');
function addMethod() {
  if (!newMethod.value.trim()) return;
  testStore.addMethod(newMethod.value);
  newMethod.value = '';
}
function removeMethod(idx) {
  testStore.removeMethod(idx);
}

onMounted(() => {
  testStore.fetchAll();
});
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
