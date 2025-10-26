import { defineStore } from 'pinia';
import api from '@/services/apiServices';

function ensureString(value, fallback = '') {
  return typeof value === 'string' && value.trim().length ? value : fallback;
}

function normalizePermission(entry = {}) {
  const id =
    ensureString(entry.id) ||
    ensureString(entry.identifier) ||
    ensureString(entry.code) ||
    ensureString(entry.ulid) ||
    `TEMP-${Date.now()}`;

  return {
    id,
    name: ensureString(entry.name) || ensureString(entry.title) || 'Permission',
    description: ensureString(entry.description),
    createdAt: entry.created_at || entry.createdAt || '',
    updatedAt: entry.updated_at || entry.updatedAt || '',
  };
}

const fallbackPermissions = [
  {
    id: '01K7PM0Y5S9TZW7FV7X06X7R5G',
    name: 'Kelola Pengguna',
    description: 'Menambah, mengubah, dan menonaktifkan pengguna.',
    created_at: '2025-08-01T10:00:00+07:00',
    updated_at: '2025-10-12T08:00:00+07:00',
  },
  {
    id: '01K7PM0Y5X386E29KP81J7TC6N',
    name: 'Kelola Role',
    description: 'Mengatur role beserta permission-nya.',
    created_at: '2025-08-02T10:00:00+07:00',
    updated_at: '2025-10-10T15:20:00+07:00',
  },
  {
    id: '01K7PM0Y61H6AJK6YF6E1G5Y1X',
    name: 'Approve Permintaan',
    description: 'Memberi persetujuan permintaan pengujian.',
    created_at: '2025-08-05T10:00:00+07:00',
    updated_at: '2025-10-16T09:40:00+07:00',
  },
  {
    id: '01K7PM0Y66D3K9VVCY9GZC1W2R',
    name: 'Lihat Laporan',
    description: 'Melihat laporan keuangan dan aktivitas.',
    created_at: '2025-08-10T10:00:00+07:00',
    updated_at: '2025-10-19T11:05:00+07:00',
  },
];

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: [],
    loading: false,
    saving: false,
    error: null,
    pagination: {
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
      totalItems: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    search: '',
  }),

  actions: {
    async fetchPermissions(params = {}) {
      this.loading = true;
      const page = params.page ?? this.pagination.currentPage;
      const perPage = params.perPage ?? this.pagination.perPage;
      const search = params.search ?? this.search ?? '';

      try {
        const response = await api.get('/api/v1/permissions', {
          params: {
            page,
            per_page: perPage,
            search: search || undefined,
          },
        });

        const payload = response.data?.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizePermission(item))
          : [];

        if (!items.length && !this.permissions.length) {
          this.permissions = fallbackPermissions.map((item) => normalizePermission(item));
          this.pagination = {
            currentPage: 1,
            perPage: fallbackPermissions.length,
            lastPage: 1,
            totalItems: fallbackPermissions.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
          this.error =
            'Dummy mode aktif: API /api/v1/permissions belum tersedia, menampilkan data contoh.';
        } else {
          this.permissions = items;
          this.pagination = {
            currentPage: payload.current_page ?? page,
            perPage: payload.per_page ?? perPage,
            lastPage: payload.last_page ?? payload.total_pages ?? page,
            totalItems: payload.total_items ?? items.length,
            hasNextPage: payload.has_next_page ?? false,
            hasPrevPage: payload.has_prev_page ?? false,
          };
          this.error = null;
        }
      } catch (err) {
        console.warn('[PermissionStore] Gagal memuat data dari API, menggunakan dummy', err);
        this.permissions = fallbackPermissions.map((item) => normalizePermission(item));
        this.pagination = {
          currentPage: 1,
          perPage: fallbackPermissions.length,
          lastPage: 1,
          totalItems: fallbackPermissions.length,
          hasNextPage: false,
          hasPrevPage: false,
        };
        this.error =
          'Dummy mode aktif: API /api/v1/permissions belum tersedia, menampilkan data contoh.';
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      await this.fetchPermissions();
    },

    async changePage(page) {
      if (page < 1 || page === this.pagination.currentPage) return;
      await this.fetchPermissions({ page });
    },

    setSearch(value) {
      this.search = value;
    },

    async createPermission(payload) {
      this.saving = true;
      try {
        const response = await api.post('/api/v1/permissions', payload);
        const created = normalizePermission(response.data?.data ?? response.data);
        if (this.pagination.currentPage === 1) {
          this.permissions = [
            created,
            ...this.permissions.filter((item) => item.id !== created.id),
          ];
        }
        await this.fetchPermissions({ page: this.pagination.currentPage });
        return { ok: true, data: created };
      } catch (err) {
        console.warn('[PermissionStore] API create permission gagal, simpan dummy', err);
        const created = normalizePermission({
          ...payload,
          created_at: new Date().toISOString(),
        });
        this.permissions = [created, ...this.permissions];
        this.pagination.totalItems += 1;
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, data: created, dummy: true };
      } finally {
        this.saving = false;
      }
    },

    async updatePermission(id, payload) {
      this.saving = true;
      try {
        const response = await api.put(`/api/v1/permissions/${id}`, payload);
        const updated = normalizePermission(response.data?.data ?? response.data);
        const idx = this.permissions.findIndex((item) => item.id === id);
        if (idx !== -1) this.permissions[idx] = updated;
        await this.fetchPermissions({ page: this.pagination.currentPage });
        return { ok: true, data: updated };
      } catch (err) {
        console.warn('[PermissionStore] API update permission gagal, simpan dummy', err);
        const idx = this.permissions.findIndex((item) => item.id === id);
        if (idx !== -1) {
          this.permissions[idx] = normalizePermission({
            ...this.permissions[idx],
            ...payload,
            updated_at: new Date().toISOString(),
          });
        }
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, dummy: true };
      } finally {
        this.saving = false;
      }
    },

    async removePermission(id) {
      this.saving = true;
      try {
        await api.delete(`/api/v1/permissions/${id}`);
        this.permissions = this.permissions.filter((item) => item.id !== id);
        await this.fetchPermissions({ page: this.pagination.currentPage });
        return { ok: true };
      } catch (err) {
        console.warn('[PermissionStore] API delete permission gagal, hapus dummy', err);
        this.permissions = this.permissions.filter((item) => item.id !== id);
        this.pagination.totalItems = Math.max(0, this.pagination.totalItems - 1);
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, dummy: true };
      } finally {
        this.saving = false;
      }
    },
  },
});
