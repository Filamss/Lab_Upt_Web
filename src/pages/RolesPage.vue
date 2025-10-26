<template>
  <div class="space-y-5">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">Manajemen Role</h2>
        <p class="text-sm text-gray-500">
          Kelompokkan akses pengguna dengan role dan permission yang fleksibel.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          @click="refreshRoles"
        >
          <ArrowPathIcon
            :class="['h-5 w-5', roleStore.loading ? 'animate-spin text-primary' : 'text-gray-500']"
          />
          Muat Ulang
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          @click="openCreateForm"
        >
          <PlusIcon class="h-5 w-5" />
          Tambah Role
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Total Role</p>
        <p class="mt-2 text-2xl font-semibold text-surfaceDark">
          {{ roleStore.pagination.totalItems }}
        </p>
        <p class="text-xs text-gray-400">Jumlah role terdaftar di sistem.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Permission Terdaftar</p>
        <p class="mt-2 text-2xl font-semibold text-primaryDark">
          {{ permissionOptions.length }}
        </p>
        <p class="text-xs text-gray-400">Gunakan permission untuk membatasi akses.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Role Populer</p>
        <p class="mt-2 text-sm font-semibold text-surfaceDark">
          {{ topRoleLabel }}
        </p>
        <p class="text-xs text-gray-400">
          Role dengan jumlah pengguna terbanyak.
        </p>
      </article>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative w-full sm:w-72">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Cari role berdasarkan nama..."
              class="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
        <p v-if="roleStore.error" class="text-xs text-red-500">
          {{ roleStore.error }}
        </p>
      </div>

      <div v-if="roleStore.loading" class="flex items-center justify-center gap-3 py-10 text-sm text-gray-500">
        <ArrowPathIcon class="h-5 w-5 animate-spin text-primary" />
        Memuat data role...
      </div>
      <div v-else>
        <DataTable
          :columns="columns"
          :rows="rows"
          :searchable="false"
          :filterable="false"
          :showPagination="false"
          mobile-mode="stack"
          :no-data-text="noDataText"
        >
          <template #permissions="{ row }">
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="permission in limitedPermissions(row.permissions)"
                :key="permission.id"
                class="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700"
              >
                {{ permission.name }}
              </span>
              <span
                v-if="row.permissionCount > maxPermissionChip"
                class="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600"
              >
                +{{ row.permissionCount - maxPermissionChip }} lagi
              </span>
              <span v-if="!row.permissionCount" class="text-xs text-gray-400">Belum ada permission</span>
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
            <div class="flex gap-2">
              <button
                class="rounded-md p-1.5 text-primary transition hover:bg-primary/10"
                title="Edit role"
                @click="openEditForm(row)"
              >
                <PencilSquareIcon class="h-5 w-5" />
              </button>
              <button
                class="rounded-md p-1.5 text-danger transition hover:bg-danger/10"
                title="Hapus role"
                @click="handleDelete(row)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </template>
        </DataTable>

        <div class="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Halaman
            <span class="font-semibold text-gray-800">{{ roleStore.pagination.currentPage }}</span>
            dari
            <span class="font-semibold text-gray-800">{{ roleStore.pagination.lastPage }}</span>
            ({{ rows.length }} role ditampilkan)
          </p>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!roleStore.pagination.hasPrevPage"
              @click="changePage(roleStore.pagination.currentPage - 1)"
            >
              Sebelumnya
            </button>
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!roleStore.pagination.hasNextPage"
              @click="changePage(roleStore.pagination.currentPage + 1)"
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
            {{ isEdit ? 'Edit Role' : 'Tambah Role' }}
          </h3>
          <FormRole
            :model-value="selectedRole"
            :permission-options="permissionOptions"
            :loading="roleStore.saving"
            :is-edit="isEdit"
            @cancel="closeForm"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </transition>
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
import FormRole from '@/components/form/FormRole.vue';
import { useRoleStore } from '@/stores/useRoleStore';
import { usePermissionStore } from '@/stores/usePermissionStore';

const roleStore = useRoleStore();
const permissionStore = usePermissionStore();

const columns = [
  { field: 'name', title: 'Nama Role' },
  { field: 'permissions', title: 'Permission', slotName: 'permissions' },
  { field: 'timeline', title: 'Riwayat', slotName: 'timeline' },
  { field: 'actions', title: 'Aksi', slotName: 'actions', className: 'text-left' },
];

const searchTerm = ref('');
const showForm = ref(false);
const selectedRole = ref(null);
const isEdit = ref(false);
const initialized = ref(false);
const maxPermissionChip = 3;
let debounceTimer = null;

const rows = computed(() => roleStore.roles);

const permissionOptions = computed(() => {
  if (permissionStore.permissions.length) return permissionStore.permissions;
  return roleStore.permissionPool;
});

const noDataText = computed(() => {
  if (roleStore.search) return 'Role tidak ditemukan untuk kata kunci tersebut.';
  return 'Belum ada role yang terdaftar.';
});

const topRoleLabel = computed(() => {
  if (!roleStore.roles.length) return 'Belum tersedia';
  const sorted = [...roleStore.roles].sort((a, b) => b.userCount - a.userCount);
  const top = sorted[0];
  if (!top?.userCount) return `${top.name} (0 pengguna)`;
  return `${top.name} (${top.userCount} pengguna)`;
});

watch(
  searchTerm,
  (value) => {
    roleStore.setSearch(value);
    if (!initialized.value) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      roleStore.fetchRoles({ page: 1, search: value });
    }, 400);
  }
);

onMounted(async () => {
  await Promise.all([permissionStore.fetchPermissions({ perPage: 200 }), roleStore.fetchRoles()]);
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

function limitedPermissions(list = []) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, maxPermissionChip);
}

async function refreshRoles() {
  await roleStore.fetchRoles({
    page: roleStore.pagination.currentPage,
    search: roleStore.search,
  });
}

async function changePage(page) {
  await roleStore.changePage(page);
}

function openCreateForm() {
  selectedRole.value = null;
  isEdit.value = false;
  showForm.value = true;
}

function openEditForm(role) {
  selectedRole.value = { ...role };
  isEdit.value = true;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  selectedRole.value = null;
  isEdit.value = false;
}

async function handleSubmit(payload) {
  if (isEdit.value && selectedRole.value) {
    await roleStore.updateRole(selectedRole.value.id, payload);
  } else {
    await roleStore.createRole(payload);
  }
  closeForm();
}

async function handleDelete(role) {
  if (!role?.id) return;
  const ok = window.confirm(`Hapus role ${role.name}?`);
  if (!ok) return;
  await roleStore.removeRole(role.id);
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
