<template>
  <div>
    <!-- Search box -->
    <div v-if="searchable" class="mb-4">
      <input
        type="text"
        v-model="searchTerm"
        :placeholder="'Cari...'"
        class="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-64 focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border border-gray-200">
        <thead class="bg-muted">
          <tr>
            <th
              v-for="(col, idx) in columns"
              :key="idx"
              scope="col"
              class="px-3 py-2 border-b border-gray-200 text-left font-medium text-gray-700 cursor-pointer"
              @click="sortable && sortBy(col.key)"
            >
              <span>{{ col.label }}</span>
              <span v-if="sortable && sortKey === col.key">
                {{ sortAsc ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIndex) in paginatedRows" :key="rIndex" class="even:bg-white odd:bg-gray-50">
            <td
              v-for="col in columns"
              :key="col.key"
              class="px-3 py-2 border-b border-gray-200"
            >
              <!-- If a scoped slot for this column key exists, use it -->
              <slot :name="`cell-${col.key}`" :row="row">{{ row[col.key] }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Pagination controls -->
    <div v-if="paginated && totalPages > 1" class="mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-600">
        Menampilkan {{ startItem }}–{{ endItem }} dari {{ filteredRows.length }} data
      </div>
      <div class="flex items-center gap-2">
        <button
          :disabled="currentPage === 1"
          @click="currentPage--"
          class="bg-white border border-gray-300 px-2 py-1 text-sm rounded disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <span class="text-sm">{{ currentPage }}/{{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="currentPage++"
          class="bg-white border border-gray-300 px-2 py-1 text-sm rounded disabled:opacity-50"
        >
          Berikutnya
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  searchable: { type: Boolean, default: false },
  sortable: { type: Boolean, default: false },
  paginated: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
});

const searchTerm = ref('');
const sortKey = ref(null);
const sortAsc = ref(true);
const currentPage = ref(1);

function sortBy(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = true;
  }
}

const filteredRows = computed(() => {
  let data = props.rows;
  if (props.searchable && searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    data = data.filter((row) =>
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }
  if (props.sortable && sortKey.value) {
    data = [...data].sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      if (valA === valB) return 0;
      if (sortAsc.value) {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });
  }
  return data;
});

const totalPages = computed(() => {
  return props.paginated ? Math.ceil(filteredRows.value.length / props.pageSize) : 1;
});

const paginatedRows = computed(() => {
  if (!props.paginated) return filteredRows.value;
  const start = (currentPage.value - 1) * props.pageSize;
  const end = start + props.pageSize;
  return filteredRows.value.slice(start, end);
});

const startItem = computed(() => {
  if (!props.paginated) return 1;
  return (currentPage.value - 1) * props.pageSize + 1;
});
const endItem = computed(() => {
  if (!props.paginated) return filteredRows.value.length;
  return Math.min(startItem.value + props.pageSize - 1, filteredRows.value.length);
});

// Watch rows length to reset current page if necessary
watch(
  () => filteredRows.value.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value;
    }
  }
);
</script>