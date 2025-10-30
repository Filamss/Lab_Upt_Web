<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-2">
      <p
        class="text-xs font-semibold uppercase tracking-wide text-primaryLight"
      >
        Manajemen Pengguna
      </p>
      <h1 class="text-2xl font-semibold text-surfaceDark">
        Kode Undangan Admin
      </h1>
      <p class="text-sm text-gray-500 max-w-2xl">
        Buat dan kelola kode undangan khusus staf internal. Kode ini dapat
        dibagikan kepada calon admin agar bisa melakukan registrasi.
      </p>
    </header>

    <section
      class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-5 sm:p-6"
    >
      <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div class="flex-1 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <label class="text-sm font-medium text-gray-700">Role tujuan</label>
              <button
                type="button"
                class="hidden lg:inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:border-primary/50 hover:text-primary transition"
                :disabled="isLoading"
                @click="handleRefresh"
              >
                <ArrowPathIcon class="h-4 w-4" />
                Segarkan Role
              </button>
            </div>
            <select
              v-model="form.roleId"
              class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-inner transition focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100"
            >
              <option value="" disabled>
                {{
                  roleOptions.length
                    ? 'Pilih role penerima kode'
                    : 'Belum ada role yang tersedia'
                }}
              </option>
              <option
                v-for="option in roleOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.name }}
              </option>
            </select>
          </div>

          <form
            class="flex flex-col gap-2"
            @submit.prevent="handleGenerate"
          >
            <div class="flex gap-2">
              <button
                type="button"
                class="inline-flex lg:hidden items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-primary/50 hover:text-primary transition"
                :disabled="isLoading"
                @click="handleRefresh"
              >
                <ArrowPathIcon class="h-4 w-4" />
              </button>
              <button
                type="submit"
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isGenerateDisabled"
              >
                <PlusIcon class="h-4 w-4" />
                <span>Buat Kode</span>
              </button>
            </div>
            <div class="rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs text-primaryDark">
              Kode otomatis kedaluwarsa setelah 24 jam, hanya dapat digunakan 1 kali,
              dan akan dihapus dari daftar setelah lewat masa aktif.
            </div>
          </form>
        </div>

        <p
          v-if="errorMessage || formError"
          class="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-700 sm:px-4"
        >
          {{ errorMessage || formError }}
        </p>
      </div>
    </section>

    <section class="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
        <h2 class="text-base font-semibold text-gray-800">
          Daftar Kode Aktif
        </h2>
      </div>
      <div class="p-4 sm:p-6">
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-10 text-sm text-gray-500"
        >
          Memuat data kode undangan...
        </div>

        <div
          v-else-if="!codes.length"
          class="flex flex-col items-center gap-3 py-10 text-center text-gray-500"
        >
          <svg
            class="h-10 w-10 text-gray-300"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 7.5l7.5 7.5m0 0L21 7.5M10.5 15L3 22.5M10.5 15l7.5 7.5"
            />
          </svg>
          <p class="text-base font-medium text-gray-700">
            Belum ada kode undangan
          </p>
          <p class="text-sm max-w-sm">
            Klik tombol <strong>Buat Kode</strong> untuk mengenerate kode
            undangan baru bagi admin.
          </p>
        </div>

        <div v-else class="space-y-4">
          <div class="md:hidden space-y-4">
            <article
              v-for="item in codes"
              :key="item.id"
              class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="font-mono text-sm font-semibold text-gray-800">
                  {{ item.code }}
                </span>
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                    statusClass(item.status, item.expiresAt),
                  ]"
                >
                  {{ statusLabel(item.status, item.expiresAt) }}
                </span>
              </div>
              <dl class="mt-4 space-y-3 text-sm text-gray-600">
                <div class="flex justify-between">
                  <dt class="font-medium text-gray-500">Role</dt>
                  <dd class="text-right">{{ item.roleName || item.roleId || '-' }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="font-medium text-gray-500">Penggunaan</dt>
                  <dd class="text-right">{{ item.usageLimit || 1 }} kali</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="font-medium text-gray-500">Terpakai</dt>
                  <dd class="text-right">{{ item.usedCount || 0 }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="font-medium text-gray-500">Kedaluwarsa</dt>
                  <dd class="text-right">
                    <span v-if="item.expiresAt">
                      {{ formatDate(item.expiresAt) }}
                    </span>
                    <span v-else>-</span>
                  </dd>
                </div>
              </dl>
              <button
                class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-danger/20 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 transition"
                @click="handleDelete(item)"
              >
                <TrashIcon class="h-4 w-4" />
                Hapus
              </button>
            </article>
          </div>

          <div class="hidden overflow-x-auto md:block">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">
                    Kode
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">
                    Role
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">
                    Penggunaan
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">
                    Terpakai
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">
                    Kedaluwarsa
                  </th>
                  <th class="px-4 py-3 text-left font-semibold text-gray-600">
                    Status
                  </th>
                  <th class="px-4 py-3 text-center font-semibold text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr v-for="item in codes" :key="item.id">
                <td class="px-4 py-4 font-mono text-sm text-gray-800">
                  {{ item.code }}
                </td>
                <td class="px-4 py-4 text-gray-600">
                  {{ item.roleName || item.roleId || '-' }}
                </td>
                <td class="px-4 py-4 text-gray-600">
                  {{ item.usageLimit || 1 }} kali
                </td>
                <td class="px-4 py-4 text-gray-600">
                  {{ item.usedCount || 0 }}
                </td>
                <td class="px-4 py-4 text-gray-600">
                  <span v-if="item.expiresAt">{{
                    formatDate(item.expiresAt)
                  }}</span>
                  <span v-else>-</span>
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                      statusClass(item.status, item.expiresAt),
                    ]"
                  >
                    {{ statusLabel(item.status, item.expiresAt) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-right">
                  <button
                    class="inline-flex items-center gap-1 rounded-md border border-danger/20 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition"
                    @click="handleDelete(item)"
                  >
                    <TrashIcon class="h-4 w-4" />
                    Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { ArrowPathIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline';
import { useKodeUndanganStore } from '@/stores/useKodeUndanganStore';
import { useConfirmDialog } from '@/stores/useConfirmDialog';
import { useRoleStore } from '@/stores/useRoleStore';

const kodeUndanganStore = useKodeUndanganStore();
const openConfirm = useConfirmDialog();
const roleStore = useRoleStore();

const form = reactive({
  roleId: '',
});

const codes = computed(() => kodeUndanganStore.codes);
const isLoading = computed(() => kodeUndanganStore.loading);
const isSaving = computed(() => kodeUndanganStore.saving);
const errorMessage = computed(() => kodeUndanganStore.error);
const formError = ref('');

const roleOptions = computed(() =>
  roleStore.roles.map((role) => ({
    id: role.id,
    name: role.name,
  }))
);

const isGenerateDisabled = computed(
  () => !form.roleId || isSaving.value || !roleOptions.value.length
);

onMounted(async () => {
  await Promise.all([
    roleStore.fetchRoles({ perPage: 100 }),
    kodeUndanganStore.fetchKodeUndangan(),
  ]);
});

async function handleRefresh() {
  formError.value = '';
  await Promise.all([
    roleStore.fetchRoles({ perPage: 100 }),
    kodeUndanganStore.refresh(),
  ]);
}

async function handleGenerate() {
  formError.value = '';
  if (!form.roleId) {
    formError.value = 'Pilih role penerima kode terlebih dahulu.';
    return;
  }
  const selectedRole =
    roleOptions.value.find((option) => option.id === form.roleId) || null;
  await kodeUndanganStore.generateKodeUndangan({
    role_id: form.roleId,
    role_name: selectedRole?.name ?? '',
  });
  form.roleId = '';
}

async function handleDelete(item) {
  const confirmed = await openConfirm({
    title: 'Hapus kode undangan?',
    message: `Kode ${item.code} akan dihapus dan tidak bisa digunakan lagi.`,
    confirmLabel: 'Hapus',
    variant: 'danger',
  });
  if (!confirmed) return;
  await kodeUndanganStore.deleteKodeUndangan(item.id);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusClass(status, expiresAt) {
  if (status === 'revoked') return 'bg-rose-100 text-rose-700';
  if (status === 'inactive') return 'bg-gray-200 text-gray-600';
  if (expiresAt && isExpired(expiresAt)) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

function statusLabel(status, expiresAt) {
  if (status === 'revoked') return 'Dicabut';
  if (status === 'inactive') return 'Tidak aktif';
  if (expiresAt && isExpired(expiresAt)) return 'Kedaluwarsa';
  return 'Aktif';
}

function isExpired(expiresAt) {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}
</script>
