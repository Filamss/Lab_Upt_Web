<template>
  <div>
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard label="Order Baru" :value="countByStatus('new')" type="new" />
      <StatCard
        label="Menunggu Validasi"
        :value="countByStatus('pending_validation')"
        type="pending"
      />
      <StatCard
        label="Dalam Uji"
        :value="countByStatus('in_testing')"
        type="testing"
      />
      <StatCard
        label="Selesai"
        :value="countByStatus('completed')"
        type="completed"
      />
    </div>

    <!-- Chart Placeholder -->
    <div
      class="bg-white rounded-xl shadow-md p-4 h-64 mb-6 flex items-center justify-center text-gray-400"
    >
      Chart mingguan (placeholder)
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Cari Customer</label
        >
        <input
          v-model="filters.search"
          type="text"
          placeholder="Nama customer..."
          class="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Status</label
        >
        <select
          v-model="filters.status"
          class="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua</option>
          <option value="new">Baru</option>
          <option value="pending_validation">Menunggu Validasi</option>
          <option value="in_testing">Dalam Uji</option>
          <option value="completed">Selesai</option>
        </select>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-md p-4 mb-8">
      <h3 class="text-lg font-semibold mb-3 text-primaryDark">Daftar Order</h3>

      <div v-if="isLoading" class="text-center text-gray-500 py-6">
        Memuat data...
      </div>

      <vue3-datatable
        v-else
        :headers="orderHeaders"
        :items="filteredOrders"
        :rows-per-page="5"
        theme-color="#0284C7"
        table-class="rounded-md overflow-hidden"
        header-text-direction="left"
        no-data-text="Belum ada data order."
      >
        <template #item-status="{ status }">
          <Badge :status="status" />
        </template>

        <template #item-remaining="{ remaining }">
          Rp {{ Number(remaining || 0).toLocaleString('id-ID') }}
        </template>

        <template #item-action="{ item }">
          <router-link
            v-if="item?.id"
            :to="{ path: '/kaji-ulang', query: { orderId: item.id } }"
            class="text-blue-600 hover:underline text-sm"
          >
            Detail
          </router-link>
        </template>
      </vue3-datatable>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-md p-4">
      <h3 class="text-lg font-semibold mb-3 text-primaryDark">
        Aktivitas Terbaru
      </h3>

      <div v-if="isLoading" class="text-center text-gray-500 py-6">
        Memuat aktivitas...
      </div>

      <vue3-datatable
        v-else
        :headers="activityHeaders"
        :items="recentActivities"
        :rows-per-page="5"
        theme-color="#0284C7"
        table-class="rounded-md overflow-hidden"
        header-text-direction="left"
        no-data-text="Belum ada aktivitas."
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useCustomerStore } from '@/stores/useCustomerStore';
import { useActivityStore } from '@/stores/useActivityStore';
import { useUserStore } from '@/stores/useUserStore';
import StatCard from '@/components/StatCard.vue';
import Badge from '@/components/Badge.vue';

// === Store setup ===
const orderStore = useKajiUlangStore();
const customerStore = useCustomerStore();
const activityStore = useActivityStore();
const userStore = useUserStore();
const isLoading = ref(true);

// === Fetch data on mount ===
onMounted(async () => {
  try {
    await Promise.all([
      orderStore.fetchAll?.(),
      customerStore.fetchAll?.(),
      activityStore.fetchAll?.(),
      userStore.fetchAll?.(),
    ]);
  } finally {
    isLoading.value = false;
  }
});

// === Lookup customer name ===
const customerMap = computed(() => {
  const map = {};
  (customerStore.customers || []).forEach((c) => {
    map[c.id] = c.name;
  });
  return map;
});

// === Headers ===
const orderHeaders = [
  { text: 'No Order', value: 'orderNo' },
  { text: 'Customer', value: 'customerName' },
  { text: 'Komoditi', value: 'commodity' },
  { text: 'Status', value: 'status' },
  { text: 'Tgl Masuk', value: 'date' },
  { text: 'Sisa Bayar', value: 'remaining' },
  { text: 'Aksi', value: 'action' },
];

const activityHeaders = [
  { text: 'Tanggal', value: 'date' },
  { text: 'Pengguna', value: 'userName' },
  { text: 'Aksi', value: 'action' },
  { text: 'Order', value: 'orderNo' },
];

// === Filters ===
const filters = reactive({
  search: '',
  status: '',
});

// === KPI ===
function countByStatus(status) {
  return (orderStore.orders || []).filter((o) => o.status === status).length;
}

// === Flatten Orders ===
const flattenedOrders = computed(() =>
  (orderStore.orders || []).map((o) => ({
    ...o,
    customerName: customerMap.value[o.customerId] ?? '',
  }))
);

// === Filtered Orders ===
const filteredOrders = computed(() =>
  flattenedOrders.value.filter((o) => {
    const matchSearch = filters.search
      ? o.customerName?.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchStatus = filters.status ? o.status === filters.status : true;
    return matchSearch && matchStatus;
  })
);

// === Recent Activities ===
const recentActivities = computed(() =>
  (activityStore.activities || []).slice(0, 5).map((a) => {
    const user = userStore.users?.find((u) => u.id === a.userId) ?? null;
    const order = orderStore.orders?.find((o) => o.id === a.orderId) ?? null;
    return {
      date: a.timestamp ? new Date(a.timestamp).toLocaleString('id-ID') : '-',
      userName: user?.name || '—',
      action: a.action || '—',
      orderNo: order?.orderNo || '—',
    };
  })
);
</script>

<style scoped>
.text-primaryDark {
  color: #075985;
}
</style>
