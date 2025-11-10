<template>
  <div class="space-y-5">
    <div
      v-if="!canViewUsers"
      class="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
    >
      <p class="text-base font-semibold">Akses ditolak</p>
      <p class="mt-1">
        Anda tidak memiliki izin untuk mengakses halaman manajemen pengguna. Hubungi administrator
        bila Anda memerlukan akses users.index.
      </p>
    </div>

    <template v-else>
      <header
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">Manajemen Pengguna</h2>
          <p class="text-sm text-gray-500">
            Atur akun, role, dan status akses pengguna Sistem Informasi Pelayanan Pengujian.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            @click="refreshUsers"
          >
          <ArrowPathIcon
            :class="['h-5 w-5', userStore.loading ? 'animate-spin text-primary' : 'text-gray-500']"
          />
          Muat Ulang
        </button>
        <button
          v-if="canCreateUser"
          class="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          @click="openCreateForm"
        >
          <PlusIcon class="h-5 w-5" />
          Tambah Pengguna
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Total Pengguna</p>
        <p class="mt-2 text-2xl font-semibold text-surfaceDark">
          {{ userStore.pagination.totalItems }}
        </p>
        <p class="text-xs text-gray-400">
          Termasuk pengguna dari seluruh halaman.
        </p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Aktif (halaman ini)</p>
        <p class="mt-2 text-2xl font-semibold text-emerald-600">
          {{ activeCount }}
        </p>
        <p class="text-xs text-gray-400">
          {{ activePercentage }}% dari pengguna pada halaman ini aktif.
        </p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Role Terdaftar</p>
        <p class="mt-2 text-2xl font-semibold text-surfaceDark">
          {{ roleOptions.length }}
        </p>
        <p class="text-xs text-gray-400">
          Role tersedia untuk assignment cepat.
        </p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Terakhir Diperbarui</p>
        <p class="mt-2 text-sm font-medium text-surfaceDark">
          {{ lastRefreshedLabel }}
        </p>
        <p class="text-xs text-gray-400">Gunakan tombol muat ulang untuk sinkron.</p>
      </article>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white shadow-sm px-3 sm:px-4">
      <div class="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative w-full sm:w-72">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Cari nama atau email pengguna..."
              class="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>

          <select
            v-model="selectedRole"
            class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40 sm:w-52"
          >
            <option value="">Semua Role</option>
            <option v-for="role in roleOptions" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>

          <select
            v-model="statusFilter"
            class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40 sm:w-48"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
        <p v-if="userStore.error" class="text-xs text-red-500">
          {{ userStore.error }}
        </p>
      </div>

      <div v-if="userStore.loading" class="flex items-center justify-center gap-3 py-10 text-sm text-gray-500">
        <ArrowPathIcon class="h-5 w-5 animate-spin text-primary" />
        Memuat data pengguna...
      </div>
      <div v-else class="overflow-x-auto">
        <DataTable
          :columns="columns"
          :rows="rows"
          :searchable="false"
          :filterable="false"
          :showPagination="false"
          mobile-mode="stack"
          body-scroll-height="60vh"
          scroll-body-on-mobile
          :no-data-text="noDataText"
        >
          <template #roles="{ value }">
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="role in value"
                :key="role.id"
                class="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primaryDark"
              >
                {{ role.name }}
              </span>
              <span v-if="!value.length" class="text-xs text-gray-400">Tidak ada role</span>
            </div>
          </template>

          <template #status="{ row }">
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'rounded-full px-2 py-1 text-xs font-medium',
                  row.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-200 text-gray-600',
                ]"
              >
                {{ row.isActive ? 'Aktif' : 'Tidak Aktif' }}
              </span>
              <label
                class="relative inline-flex items-center"
                :class="[
                  canUpdateUser
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed opacity-60 pointer-events-none',
                ]"
              >
                <input
                  :checked="row.isActive"
                  type="checkbox"
                  class="peer sr-only"
                  :disabled="!canUpdateUser"
                  @change="(event) => handleToggleStatus(row, event.target.checked)"
                />
                <div class="h-5 w-10 rounded-full bg-gray-300 transition peer-checked:bg-primary"></div>
                <div class="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-5"></div>
              </label>
            </div>
          </template>

          <template #timeline="{ row }">
            <div class="space-y-1 text-xs text-gray-600">
              <p>
                Dibuat:
                <span class="font-medium text-gray-700">
                  {{ formatDate(row.createdAt) }}
                </span>
              </p>
              <p>
                Diperbarui:
                <span class="font-medium text-gray-700">
                  {{ formatDate(row.updatedAt) }}
                </span>
              </p>
            </div>
          </template>

          <template #actions="{ row }">
            <div class="flex gap-1">
              <button
                v-if="canUpdateUser"
                class="rounded-md inline-flex items-center gap-1 p-1.5 text-primary transition hover:bg-primary/10"
                title="Edit pengguna"
                @click="openEditForm(row)"
              >
                <PencilSquareIcon class="h-4 w-4" />
              </button>
              <button
                v-if="canDeleteUser"
                class="rounded-md inline-flex items-center gap-1 p-1.5 text-danger transition hover:bg-danger/10"
                title="Hapus pengguna"
                @click="handleDelete(row)"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </template>
        </DataTable>

        <div class="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Halaman
            <span class="font-semibold text-gray-800">{{ userStore.pagination.currentPage }}</span>
            dari
            <span class="font-semibold text-gray-800">{{ userStore.pagination.lastPage }}</span>
            ({{ rows.length }} pengguna ditampilkan)
          </p>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!userStore.pagination.hasPrevPage"
              @click="changePage(userStore.pagination.currentPage - 1)"
            >
              Sebelumnya
            </button>
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!userStore.pagination.hasNextPage"
              @click="changePage(userStore.pagination.currentPage + 1)"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </section>

    <transition name="fade">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
      >
        <div class="relative w-[95%] md:w-[600px] rounded-2xl bg-white p-4 shadow-xl">
          <button
            class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
            @click="closeForm"
          >
            <span class="sr-only">Tutup</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 class="mb-4 text-lg font-semibold text-surfaceDark">
            {{ isEdit ? 'Edit Pengguna' : 'Tambah Pengguna' }}
          </h3>
          <FormUser
            :model-value="selectedUser"
            :roles="roleOptions"
            :loading="userStore.saving"
            :is-edit="isEdit"
            @cancel="closeForm"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </transition>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import DataTable from '@/components/DataTable.vue';
import FormUser from '@/components/form/FormUser.vue';
import { useUserStore } from '@/stores/useUserStore';
import { useRoleStore } from '@/stores/useRoleStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { useAuthorization } from '@/composables/useAuthorization';

const userStore = useUserStore();
const roleStore = useRoleStore();
const openConfirm = useConfirmDialog();
const { hasPermission } = useAuthorization();

const canViewUsers = computed(() => hasPermission('users.index'));
const canCreateUser = computed(() => hasPermission('users.store'));
const canUpdateUser = computed(() => hasPermission('users.update'));
const canDeleteUser = computed(() => hasPermission('users.destroy'));

const columns = [
  { field: 'name', title: 'Nama', isSortable: false },
  { field: 'email', title: 'Email', isSortable: false },
  { field: 'employmentIdentityNumber', title: 'NIP', isSortable: false },
  { field: 'roles', title: 'Role', slotName: 'roles' },
  { field: 'status', title: 'Status', slotName: 'status', isSortable: false },
  { field: 'timeline', title: 'Riwayat', slotName: 'timeline' },
  { field: 'actions', title: 'Aksi', slotName: 'actions', className: 'text-left' },
];

const searchTerm = ref('');
const selectedRole = ref('');
const statusFilter = ref('');
const lastRefreshedAt = ref(null);
const showForm = ref(false);
const selectedUser = ref(null);
const isEdit = ref(false);
const initialized = ref(false);
let debounceTimer = null;

const rows = computed(() =>
  userStore.users.map((user) => ({
    ...user,
    status: user.isActive ? 'active' : 'inactive',
  }))
);

const roleOptions = computed(() =>
  roleStore.roles.map((role) => ({
    id: role.id,
    name: role.name,
  }))
);

const activeCount = computed(
  () => userStore.users.filter((user) => user.isActive).length
);

const activePercentage = computed(() => {
  if (!userStore.users.length) return 0;
  return Math.round((activeCount.value / userStore.users.length) * 100);
});

const noDataText = computed(() => {
  if (userStore.filters.search) return 'Tidak ada pengguna yang cocok dengan pencarian.';
  if (userStore.filters.roleId) return 'Tidak ada pengguna untuk role yang dipilih.';
  if (userStore.filters.status) return 'Tidak ada pengguna untuk status yang dipilih.';
  return 'Belum ada data pengguna.';
});

const lastRefreshedLabel = computed(() => {
  if (!lastRefreshedAt.value) return 'Belum pernah';
  return formatDate(lastRefreshedAt.value);
});

watch(
  searchTerm,
  (value) => {
    if (!canViewUsers.value) return;
    userStore.setSearch(value);
    if (!initialized.value) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      userStore.fetchUsers({ page: 1, search: value });
    }, 400);
  }
);

watch(
  selectedRole,
  (value) => {
    if (!canViewUsers.value) return;
    userStore.setRoleFilter(value);
    if (!initialized.value) return;
    userStore.fetchUsers({ page: 1, roleId: value });
  }
);

watch(
  statusFilter,
  (value) => {
    if (!canViewUsers.value) return;
    userStore.setStatusFilter(value);
    if (!initialized.value) return;
    const mapped = value === 'inactive' ? 'inactive' : value === 'active' ? 'active' : '';
    userStore.fetchUsers({
      page: 1,
      status: mapped,
    });
  }
);

onMounted(async () => {
  if (!canViewUsers.value) return;
  await Promise.all([roleStore.fetchRoles({ perPage: 100 }), userStore.fetchUsers()]);
  lastRefreshedAt.value = new Date();
  initialized.value = true;
});

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function refreshUsers() {
  if (!canViewUsers.value) return;
  await userStore.fetchUsers({
    page: userStore.pagination.currentPage,
    search: userStore.filters.search,
    roleId: userStore.filters.roleId,
    status: userStore.filters.status,
  });
  lastRefreshedAt.value = new Date();
}

async function changePage(page) {
  if (!canViewUsers.value) return;
  await userStore.changePage(page);
  lastRefreshedAt.value = new Date();
}

function openCreateForm() {
  if (!canViewUsers.value) return;
  if (!canCreateUser.value) return;
  selectedUser.value = null;
  isEdit.value = false;
  showForm.value = true;
}

function openEditForm(user) {
  if (!canViewUsers.value) return;
  if (!canUpdateUser.value) return;
  selectedUser.value = { ...user };
  isEdit.value = true;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  selectedUser.value = null;
  isEdit.value = false;
}

async function handleSubmit(payload) {
  if (!canViewUsers.value) return;
  if (isEdit.value && selectedUser.value) {
    if (!canUpdateUser.value) return;
    await userStore.updateUser(selectedUser.value.id, payload);
  } else {
    if (!canCreateUser.value) return;
    await userStore.createUser(payload);
  }
  closeForm();
  lastRefreshedAt.value = new Date();
}

async function handleDelete(user) {
  if (!canViewUsers.value) return;
  if (!canDeleteUser.value) return;
  if (!user?.id) return;
  const ok = await openConfirm({
    title: 'Hapus pengguna?',
    message: `Pengguna ${user.name} akan dihapus permanen.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!ok) return;
  await userStore.removeUser(user.id);
  lastRefreshedAt.value = new Date();
}

async function handleToggleStatus(user, isActive) {
  if (!canViewUsers.value) return;
  if (!canUpdateUser.value) return;
  await userStore.toggleActive(user.id, isActive);
  lastRefreshedAt.value = new Date();
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
