<template>
  <div class="space-y-5">
    <header
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h2 class="text-xl font-semibold text-surfaceDark sm:text-2xl">
          Manajemen Permission
        </h2>
        <p class="text-sm text-gray-500">
          Definisikan izin granular untuk mengontrol fitur yang dapat diakses
          pengguna.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          @click="refreshPermissions"
        >
          <ArrowPathIcon
            :class="[
              'h-5 w-5',
              permissionStore.loading
                ? 'animate-spin text-primary'
                : 'text-gray-500',
            ]"
          />
          Muat Ulang
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-primaryLight to-primaryDark px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          @click="openCreateForm"
        >
          <PlusIcon class="h-5 w-5" />
          Tambah Permission
        </button>
      </div>
    </header>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Total Permission
        </p>
        <p class="mt-2 text-2xl font-semibold text-surfaceDark">
          {{ permissionStore.pagination.totalItems }}
        </p>
        <p class="text-xs text-gray-400">Jumlah permission yang tersedia.</p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">
          Terakhir Diperbarui
        </p>
        <p class="mt-2 text-sm font-semibold text-surfaceDark">
          {{ lastRefreshedLabel }}
        </p>
        <p class="text-xs text-gray-400">
          Gunakan tombol muat ulang untuk sinkron.
        </p>
      </article>
      <article class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-medium uppercase text-gray-500">Filter Aktif</p>
        <p class="mt-2 text-sm font-semibold text-surfaceDark">
          {{ activeFilterLabel }}
        </p>
        <p class="text-xs text-gray-400">
          Gunakan pencarian untuk memfilter data.
        </p>
      </article>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div
        class="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative w-full sm:w-72">
            <MagnifyingGlassIcon
              class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Cari permission berdasarkan nama..."
              class="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>

        </div>
        <p v-if="permissionStore.error" class="text-xs text-red-500">
          {{ permissionStore.error }}
        </p>
      </div>

      <div
        v-if="permissionStore.loading"
        class="flex items-center justify-center gap-3 py-10 text-sm text-gray-500"
      >
        <ArrowPathIcon class="h-5 w-5 animate-spin text-primary" />
        Memuat data permission...
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
          <template #id="{ value }">
            <span class="font-mono text-xs text-gray-700 break-all">
              {{ value }}
            </span>
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
                title="Edit permission"
                @click="openEditForm(row)"
              >
                <PencilSquareIcon class="h-5 w-5" />
              </button>
              <button
                class="rounded-md p-1.5 text-danger transition hover:bg-danger/10"
                title="Hapus permission"
                @click="handleDelete(row)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </template>
        </DataTable>

        <div
          class="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Halaman
            <span class="font-semibold text-gray-800">{{
              permissionStore.pagination.currentPage
            }}</span>
            dari
            <span class="font-semibold text-gray-800">{{
              permissionStore.pagination.lastPage
            }}</span>
            ({{ rows.length }} permission ditampilkan)
          </p>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!permissionStore.pagination.hasPrevPage"
              @click="changePage(permissionStore.pagination.currentPage - 1)"
            >
              Sebelumnya
            </button>
            <button
              class="rounded-md border border-gray-200 px-3 py-1 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!permissionStore.pagination.hasNextPage"
              @click="changePage(permissionStore.pagination.currentPage + 1)"
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
        <div
          class="relative w-[95%] md:w-[560px] rounded-2xl bg-white p-4 shadow-xl"
        >
          <button
            class="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
            @click="closeForm"
          >
            <span class="sr-only">Tutup</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <h3 class="mb-4 text-lg font-semibold text-surfaceDark">
            {{ isEdit ? 'Edit Permission' : 'Tambah Permission' }}
          </h3>
          <FormPermission
            :model-value="selectedPermission"
            :loading="permissionStore.saving"
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
import FormPermission from '@/components/form/FormPermission.vue';
import { usePermissionStore } from '@/stores/usePermissionStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';

const openConfirm = useConfirmDialog();
const permissionStore = usePermissionStore();

const columns = [
  { field: 'name', title: 'Nama Permission' },
  { field: 'id', title: 'ID (ULID)', slotName: 'id' },
  { field: 'timeline', title: 'Riwayat', slotName: 'timeline' },
  {
    field: 'actions',
    title: 'Aksi',
    slotName: 'actions',
    className: 'text-left',
  },
];

const searchTerm = ref('');
const showForm = ref(false);
const selectedPermission = ref(null);
const isEdit = ref(false);
const initialized = ref(false);
const lastRefreshedAt = ref(null);
let debounceTimer = null;

const rows = computed(() => permissionStore.permissions);

const noDataText = computed(() => {
  if (permissionStore.search) {
    return 'Permission tidak ditemukan untuk kata kunci tersebut.';
  }
  return 'Belum ada permission yang terdaftar.';
});

const activeFilterLabel = computed(() =>
  permissionStore.search ? `Cari: "${permissionStore.search}"` : 'Tidak ada'
);

const lastRefreshedLabel = computed(() => {
  if (!lastRefreshedAt.value) return 'Belum pernah';
  return formatDate(lastRefreshedAt.value);
});

watch(searchTerm, (value) => {
  permissionStore.setSearch(value);
  if (!initialized.value) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    permissionStore.fetchPermissions({
      page: 1,
      search: value,
    });
  }, 400);
});

onMounted(async () => {
  await permissionStore.fetchPermissions();
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

async function refreshPermissions() {
  await permissionStore.fetchPermissions({
    page: permissionStore.pagination.currentPage,
    search: permissionStore.search,
  });
  lastRefreshedAt.value = new Date();
}

async function changePage(page) {
  await permissionStore.changePage(page);
  lastRefreshedAt.value = new Date();
}

function openCreateForm() {
  selectedPermission.value = null;
  isEdit.value = false;
  showForm.value = true;
}

function openEditForm(permission) {
  selectedPermission.value = { ...permission };
  isEdit.value = true;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  selectedPermission.value = null;
  isEdit.value = false;
}

async function handleSubmit(payload) {
  if (isEdit.value && selectedPermission.value) {
    await permissionStore.updatePermission(
      selectedPermission.value.id,
      payload
    );
  } else {
    await permissionStore.createPermission(payload);
  }
  closeForm();
  lastRefreshedAt.value = new Date();
  
}

async function handleDelete(permission) {
  if (!permission?.id) return;
  const ok = await openConfirm({
    title: 'Hapus permission?',
    message: `Permission ${permission.name} akan dihapus dari sistem.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!ok) return;
  await permissionStore.removePermission(permission.id);
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
