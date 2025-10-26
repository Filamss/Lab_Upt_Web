<template>
  <div>
    <h2 class="text-xl font-semibold mb-6">Layanan & Tarif</h2>

    <!-- === DAFTAR PENGUJIAN === -->
    <div class="bg-white rounded-xl shadow-md p-5 mb-8">
      <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h3 class="text-lg font-semibold text-surfaceDark">Daftar Pengujian</h3>
        <button
          class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-4 py-2 rounded-md text-sm shadow-sm hover:opacity-90"
          @click="showModal = true"
        >
          + Tambah Pengujian
        </button>
      </div>

      <!-- ✅ DataTable Pengujian -->
      <DataTable
        :columns="testColumns"
        :rows="filteredTests"
        :pageSize="10"
        :filterable="false"
        class="rounded-md "
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
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-surfaceDark">Mesin Uji</h3>
        <div class="flex flex-wrap gap-2">
          <input
            v-model="newMachine"
            placeholder="Nama mesin uji"
            class="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
          <button
            class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-3 py-1.5 rounded text-sm shadow-sm"
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
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-surfaceDark">Metode Uji</h3>
        <div class="flex flex-wrap gap-2">
          <input
            v-model="newMethod"
            placeholder="Nama metode uji"
            class="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
          <button
            class="bg-gradient-to-r from-primaryLight to-primaryDark text-white px-3 py-1.5 rounded text-sm shadow-sm"
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
import DataTable from '../components/DataTable.vue';

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
