<template>
  <div>
    <!-- KPI cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- KPI cards use English status keys to match the Pinia store -->
      <StatCard
        label="Order Baru"
        :value="countByStatus('new')"
        type="new"
      />
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

    <!-- Placeholder for weekly orders chart -->
    <div class="bg-white rounded-xl shadow-md p-4 h-64 mb-6 flex items-center justify-center text-gray-400">
      Chart mingguan (placeholder)
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-4">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Cari Customer</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Nama customer..."
          class="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
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

    <!-- Orders table -->
    <DataTable
      :columns="tableColumns"
      :rows="filteredOrders"
      :searchable="false"
      :sortable="true"
      :paginated="true"
      :pageSize="5"
    >
      <template #cell-status="{ row }">
        <Badge :status="row.status" />
      </template>
      <template #cell-customerName="{ row }">
        {{ row.customerName }}
      </template>
      <!-- Show remaining payment in Rupiah format -->
      <template #cell-remaining="{ row }">
        Rp {{ Number(row.remaining).toLocaleString('id-ID') }}
      </template>
      <template #cell-action="{ row }">
        <router-link
          :to="{ path: '/kaji-ulang', query: { orderId: row.id } }"
          class="text-blue-600 hover:underline text-sm"
        >
          Detail
        </router-link>
      </template>
    </DataTable>

    <!-- Recent activity table -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold mb-2">Aktivitas Terbaru</h3>
      <DataTable
        :columns="activityColumns"
        :rows="recentActivities"
        :searchable="false"
        :sortable="false"
        :paginated="false"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useOrderStore } from '@/stores/useOrderStore';
import { useCustomerStore } from '@/stores/useCustomerStore';
import { useActivityStore } from '@/stores/useActivityStore';
import { useUserStore } from '@/stores/useUserStore';
import StatCard from '@/components/StatCard.vue';
import DataTable from '@/components/DataTable.vue';
import Badge from '@/components/Badge.vue';

const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const activityStore = useActivityStore();
const userStore = useUserStore();

// Create a lookup map from customerId to customer name.  Use the
// English field `name` rather than the previous `nama`.
const customerMap = computed(() => {
  const map = {};
  customerStore.customers.forEach((c) => {
    map[c.id] = c.name;
  });
  return map;
});

// Define table columns.  Use English keys defined in the order store
const tableColumns = [
  { key: 'orderNo', label: 'No Order' },
  { key: 'customerName', label: 'Customer' },
  { key: 'commodity', label: 'Komoditi' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Tgl Masuk' },
  { key: 'remaining', label: 'Sisa Bayar' },
  { key: 'action', label: 'Aksi' },
];

// Filters
const filters = reactive({
  search: '',
  status: '',
});

// Compute order counts by status for KPI cards
function countByStatus(status) {
  return orderStore.orders.filter((o) => o.status === status).length;
}

// Flatten orders with customer names for table consumption
const flattenedOrders = computed(() => {
  return orderStore.orders.map((o) => ({
    ...o,
    customerName: customerMap.value[o.customerId] ?? '',
  }));
});

// Apply filters to orders
const filteredOrders = computed(() => {
  return flattenedOrders.value.filter((o) => {
    const matchSearch = filters.search
      ? o.customerName.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchStatus = filters.status ? o.status === filters.status : true;
    return matchSearch && matchStatus;
  });
});

// Activity table configuration.  Show date, user, action and order
const activityColumns = [
  { key: 'date', label: 'Tanggal' },
  { key: 'userName', label: 'Pengguna' },
  { key: 'action', label: 'Aksi' },
  { key: 'orderNo', label: 'Order' },
];

// Map activities to displayable rows.  We reverse to show newest first and
// limit to 5 entries.  Convert ISO timestamp to local date/time.
const recentActivities = computed(() => {
  return activityStore.activities.slice(0, 5).map((a) => {
    const user = userStore.users.find((u) => u.id === a.userId);
    const order = orderStore.orders.find((o) => o.id === a.orderId);
    return {
      date: new Date(a.timestamp).toLocaleString('id-ID'),
      userName: user?.name || '',
      action: a.action,
      orderNo: order?.orderNo || '',
    };
  });
});
</script>