<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Manajemen Pengguna</h2>
    <!-- Add user form -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Tambah Pengguna</h3>
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col">
          <label class="text-sm mb-1">Nama</label>
          <input v-model="newUser.name" type="text" class="border border-gray-300 rounded-md px-3 py-2 w-48" />
        </div>
        <div class="flex flex-col">
          <label class="text-sm mb-1">Role</label>
          <select v-model="newUser.role" class="border border-gray-300 rounded-md px-3 py-2 w-48">
            <option disabled value="">Pilih role</option>
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
          </select>
        </div>
        <button class="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg" @click="addUser" :disabled="!newUser.name || !newUser.role">
          Tambah
        </button>
      </div>
    </div>
    <!-- Users table -->
    <DataTable
      :columns="columns"
      :rows="rows"
      :searchable="true"
      :sortable="true"
      :paginated="true"
      :pageSize="10"
    >
      <template #cell-active="{ row }">
        <input type="checkbox" v-model="row.active" @change="toggleActive(row.id, row.active)" />
      </template>
      <template #cell-actions="{ row }">
        <button class="text-danger text-sm hover:underline" @click="removeUser(row.id)">Hapus</button>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import DataTable from '@/components/DataTable.vue';

const userStore = useUserStore();

const roles = ['Super Admin', 'Admin Penerima', 'Manajer Teknis', 'Penyelia', 'Teknisi', 'Customer'];

const newUser = reactive({ name: '', role: '' });

function addUser() {
  if (!newUser.name || !newUser.role) return;
  const nextId = userStore.users.length ? Math.max(...userStore.users.map((u) => u.id)) + 1 : 1;
  userStore.users.push({ id: nextId, name: newUser.name, role: newUser.role, active: true });
  newUser.name = '';
  newUser.role = '';
}

function removeUser(id) {
  const idx = userStore.users.findIndex((u) => u.id === id);
  if (idx !== -1) userStore.users.splice(idx, 1);
}

function toggleActive(id, active) {
  const u = userStore.users.find((user) => user.id === id);
  if (u) u.active = active;
}

const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Aktif' },
  { key: 'actions', label: 'Aksi' },
];

const rows = computed(() => userStore.users.map((u) => ({ ...u })));
</script>