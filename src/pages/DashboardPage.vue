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

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-600">
          <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3">No Order</th>
              <th class="px-4 py-3">Customer</th>
              <th class="px-4 py-3">Komoditi</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Tgl Masuk</th>
              <th class="px-4 py-3">Sisa Bayar</th>
              <th class="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!visibleOrders.length">
              <td
                colspan="7"
                class="px-4 py-6 text-center text-gray-500 text-sm"
              >
                Belum ada data order.
              </td>
            </tr>
            <tr
              v-for="order in visibleOrders"
              :key="order.id || order.orderNo"
              class="border-b last:border-b-0"
            >
              <td class="px-4 py-3 font-medium text-gray-900">
                {{ order.orderNo || '-' }}
              </td>
              <td class="px-4 py-3">{{ order.customerName || '-' }}</td>
              <td class="px-4 py-3">{{ order.commodity || '-' }}</td>
              <td class="px-4 py-3">
                <Badge :status="order.status" />
              </td>
              <td class="px-4 py-3">{{ order.date || '-' }}</td>
              <td class="px-4 py-3">
                Rp {{ Number(order.remaining || 0).toLocaleString('id-ID') }}
              </td>
              <td class="px-4 py-3">
                <router-link
                  v-if="order?.id"
                  :to="{ path: '/kaji-ulang', query: { orderId: order.id } }"
                  class="text-blue-600 hover:underline text-xs font-semibold"
                >
                  Detail
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-md p-4">
      <h3 class="text-lg font-semibold mb-3 text-primaryDark">
        Aktivitas Terbaru
      </h3>

      <div v-if="isLoading" class="text-center text-gray-500 py-6">
        Memuat aktivitas...
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-600">
          <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3">Tanggal</th>
              <th class="px-4 py-3">Pengguna</th>
              <th class="px-4 py-3">Aksi</th>
              <th class="px-4 py-3">Order</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!visibleActivities.length">
              <td
                colspan="4"
                class="px-4 py-6 text-center text-gray-500 text-sm"
              >
                Belum ada aktivitas.
              </td>
            </tr>
            <tr
              v-for="activity in visibleActivities"
              :key="activity.id || activity.timestamp || activity.orderNo"
              class="border-b last:border-b-0"
            >
              <td class="px-4 py-3">{{ activity.date }}</td>
              <td class="px-4 py-3">{{ activity.userName }}</td>
              <td class="px-4 py-3">{{ activity.action }}</td>
              <td class="px-4 py-3">{{ activity.orderNo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useCustomerStore } from '@/stores/useCustomerStore';
import { useActivityStore } from '@/stores/useActivityStore';
import { useUserStore } from '@/stores/useUserStore';
import StatCard from '@/components/common/StatCard.vue';
import Badge from '@/components/common/Badge.vue';

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

const rowsPerPage = 5;
const visibleOrders = computed(() =>
  filteredOrders.value.slice(0, rowsPerPage)
);

// === Recent Activities ===
const recentActivities = computed(() =>
  (activityStore.activities || []).map((a) => {
    const user = userStore.users?.find((u) => u.id === a.userId) ?? null;
    const order = orderStore.orders?.find((o) => o.id === a.orderId) ?? null;
    return {
      id: a.id,
      date: a.timestamp ? new Date(a.timestamp).toLocaleString('id-ID') : '-',
      userName: user?.name || '-',
      action: a.action || '-',
      orderNo: order?.orderNo || '-',
    };
  })
);

const visibleActivities = computed(() =>
  recentActivities.value.slice(0, rowsPerPage)
);
</script>

<style scoped>
.text-primaryDark {
  color: #075985;
}
</style>

