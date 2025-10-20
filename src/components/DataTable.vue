<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-md">
    <!-- 🔍 Search & Filter -->
    <div
      v-if="searchable || filterable"
      class="flex flex-wrap gap-3 items-center p-3 border-b bg-gray-50"
    >
      <div v-if="searchable" class="flex-1 min-w-[200px]">
        <input
          v-model="search"
          type="text"
          placeholder="Cari data..."
          class="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
        />
      </div>

      <div v-if="filterable">
        <select
          v-model="statusFilter"
          class="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option v-for="(opt, i) in statusOptions" :key="i" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- 🧾 Table (RESPONSIVE GLOBAL) -->
    <div class="w-full scroll-container no-scrollbar ">
      <table
        class="min-w-max md:min-w-full w-full table-auto table-compact md:text-sm text-left text-gray-700"
      >
        <thead
          class="bg-gray-100 text-surfaceDark uppercase text-[10px] md:text-xs text-center font-semibold"
        >
          <tr>
            <!-- Checkbox pilih semua -->
            <th
              v-if="selectable"
              class="px-2 md:px-3 py-2 sticky top-0 bg-gray-100 z-10"
            >
              <input
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
              />
            </th>

            <th
              v-for="(col, i) in columns"
              :key="i"
              :class="[
                'px-2 md:px-4 py-2 whitespace-normal md:whitespace-nowrap cursor-pointer select-none sticky top-0 bg-gray-100 z-10 break-words',
                col.className || '',
              ]"
              @click="toggleSort(col.field)"
            >
              <div class="flex items-center gap-1 justify-center">
                {{ col.title }}
                <span v-if="sortKey === col.field">
                  <svg
                    v-if="sortAsc"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 inline text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3 inline text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(row, index) in paginatedData"
            :key="index"
            class="border-b hover:bg-gray-50 transition"
          >
            <td v-if="selectable" class="px-2 md:px-3 py-2 text-center">
              <input type="checkbox" :value="row" v-model="selectedRows" />
            </td>

            <td
              v-for="(col, i) in columns"
              :key="i"
              :class="[
                'px-2 md:px-4 py-2 align-top text-center whitespace-normal break-words',
                col.className || '',
              ]"
            >
              <slot :name="col.field" :value="row[col.field]" :row="row">
                {{ row[col.field] ?? '-' }}
              </slot>
            </td>
          </tr>

          <tr v-if="!paginatedData.length">
            <td
              :colspan="columns.length + (selectable ? 1 : 0)"
              class="text-center text-gray-400 py-4"
            >
              Tidak ada data
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📄 Pagination -->
    <div
      class="flex justify-between items-center p-3 border-t bg-gray-50 text-xs text-gray-600"
    >
      <div>
        Menampilkan {{ startIndex + 1 }}–{{ endIndex }} dari
        {{ filteredData.length }}
        <span v-if="selectable && selectedRows.length">
          • {{ selectedRows.length }} dipilih</span
        >
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="px-2 py-1 rounded-md border text-gray-600 disabled:opacity-40 hover:bg-gray-100"
        >
          ‹
        </button>
        <span> {{ page }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="page === totalPages"
          class="px-2 py-1 rounded-md border text-gray-600 disabled:opacity-40 hover:bg-gray-100"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const emit = defineEmits(['update:selected']);

const props = defineProps({
  columns: { type: Array, required: true }, // [{ field, title, className? }]
  rows: { type: Array, required: true },
  pageSize: { type: Number, default: 10 },
  searchable: { type: Boolean, default: true },
  filterable: { type: Boolean, default: true },
  selectable: { type: Boolean, default: false },
  statusOptions: {
    type: Array,
    default: () => [
      { value: '', label: 'Semua Status' },
      { value: 'new', label: 'Baru' },
      { value: 'approved', label: 'Disetujui' },
      { value: 'pending_validation', label: 'Menunggu Validasi' },
      { value: 'completed', label: 'Selesai' },
    ],
  },
});

const search = ref('');
const statusFilter = ref('');
const sortKey = ref(null);
const sortAsc = ref(true);
const page = ref(1);
const selectedRows = ref([]);
const selectAll = ref(false);

watch(selectedRows, () => emit('update:selected', selectedRows.value));

function toggleSelectAll() {
  if (selectAll.value) selectedRows.value = [...paginatedData.value];
  else selectedRows.value = [];
}

const filteredData = computed(() => {
  let data = props.rows || [];
  if (search.value) {
    const keyword = search.value.toLowerCase();
    data = data.filter((row) =>
      Object.values(row ?? {})
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }
  if (statusFilter.value) {
    data = data.filter((row) => row?.status === statusFilter.value);
  }
  return data;
});

function toggleSort(field) {
  if (sortKey.value === field) sortAsc.value = !sortAsc.value;
  else {
    sortKey.value = field;
    sortAsc.value = true;
  }
  page.value = 1;
}

const sortedData = computed(() => {
  if (!sortKey.value) return filteredData.value;
  return [...filteredData.value].sort((a, b) => {
    const aVal = a?.[sortKey.value];
    const bVal = b?.[sortKey.value];
    if (aVal == null || bVal == null) return 0;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc.value ? aVal - bVal : bVal - aVal;
    }
    return sortAsc.value
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedData.value.length / props.pageSize))
);
const startIndex = computed(() => (page.value - 1) * props.pageSize);
const endIndex = computed(() =>
  Math.min(startIndex.value + props.pageSize, sortedData.value.length)
);
const paginatedData = computed(() =>
  sortedData.value.slice(startIndex.value, endIndex.value)
);

function nextPage() {
  if (page.value < totalPages.value) page.value++;
}
function prevPage() {
  if (page.value > 1) page.value--;
}

watch(
  () => props.rows,
  () => (page.value = 1)
);
</script>

<style scoped>
thead th {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
