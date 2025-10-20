<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Manajemen Pengguna</h2>

    <!-- === Add user form === -->
    <div class="bg-white rounded-xl shadow-md p-4 mb-6">
      <h3 class="text-lg font-semibold mb-4">Tambah Pengguna</h3>
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex flex-col">
          <label class="text-sm mb-1">Nama Lengkap</label>
          <input
            v-model="newUser.name"
            type="text"
            class="border border-gray-300 rounded-md px-3 py-2 w-48"
          />
        </div>

        <div class="flex flex-col">
          <label class="text-sm mb-1">Email</label>
          <input
            v-model="newUser.email"
            type="email"
            class="border border-gray-300 rounded-md px-3 py-2 w-56"
          />
        </div>

        <div class="flex flex-col">
          <label class="text-sm mb-1">Password</label>
          <input
            v-model="newUser.password"
            type="password"
            class="border border-gray-300 rounded-md px-3 py-2 w-48"
          />
        </div>

        <div class="flex flex-col">
          <label class="text-sm mb-1">Role</label>
          <select
            v-model="newUser.role"
            class="border border-gray-300 rounded-md px-3 py-2 w-48"
          >
            <option disabled value="">Pilih role</option>
            <option v-for="role in roles" :key="role" :value="role">
              {{ role }}
            </option>
          </select>
        </div>

        <button
          class="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg"
          @click="addUser"
          :disabled="!isFormValid"
        >
          Tambah
        </button>
      </div>
    </div>

    <!-- === Users table === -->
    <EasyDataTable
      :columns="columns"
      :rows="rows"
      :searchable="true"
      :sortable="true"
      :paginated="true"
      :pageSize="10"
    >
      <template #cell-password="{ row }">
        <span class="tracking-widest text-gray-500">••••••</span>
      </template>
      <template #cell-active="{ row }">
        <input
          type="checkbox"
          v-model="row.active"
          @change="toggleActive(row.id, row.active)"
        />
      </template>
      <template #cell-actions="{ row }">
        <div class="flex items-center gap-3">
          <!-- Tombol Edit -->
          <button
            class="text-primary hover:text-primaryDark transition"
            title="Edit user"
            @click="editUser(row)"
          >
            <PencilSquareIcon class="w-5 h-5" />
          </button>

          <!-- Tombol Hapus -->
          <button
            class="text-danger hover:text-red-700 transition"
            title="Hapus user"
            @click="removeUser(row.id)"
          >
            <TrashIcon class="w-5 h-5" />
          </button>
        </div>
      </template>
    </EasyDataTable>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useUserStore } from '@/stores/useUserStore';
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

const userStore = useUserStore();

// Daftar role
const roles = [
  'Super Admin',
  'Admin Penerima',
  'Manajer Teknis',
  'Penyelia',
  'Teknisi',
];

// Form user baru
const newUser = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
});

// Validasi form
const isFormValid = computed(() => {
  return newUser.name && newUser.email && newUser.password && newUser.role;
});

// Tambah user baru
function addUser() {
  if (!isFormValid.value) return;

  const nextId = userStore.users.length
    ? Math.max(...userStore.users.map((u) => u.id)) + 1
    : 1;

  userStore.users.push({
    id: nextId,
    name: newUser.name,
    email: newUser.email,
    password: newUser.password,
    role: newUser.role,
    active: true,
  });

  // Reset form
  newUser.name = '';
  newUser.email = '';
  newUser.password = '';
  newUser.role = '';
}
function editUser(user) {
  alert(`Edit user: ${user.name}`)
  // 🔹 nanti bisa diganti jadi modal form edit user
}

// Hapus user
function removeUser(id) {
  const idx = userStore.users.findIndex((u) => u.id === id);
  if (idx !== -1) userStore.users.splice(idx, 1);
}

// Toggle status aktif
function toggleActive(id, active) {
  const u = userStore.users.find((user) => user.id === id);
  if (u) u.active = active;
}

// Kolom tabel
const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'password', label: 'Password' },
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Aktif' },
  { key: 'actions', label: 'Aksi' },
];

// Baris tabel
const rows = computed(() => userStore.users.map((u) => ({ ...u })));
</script>
