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
      } catch (err) {
        console.error('[PermissionStore] Gagal memuat data dari API', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat data permission dari API.';
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
        console.error('[PermissionStore] API create permission gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menambahkan permission.';
        throw err;
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
        console.error('[PermissionStore] API update permission gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui permission.';
        throw err;
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
        console.error('[PermissionStore] API delete permission gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus permission.';
        throw err;
      } finally {
        this.saving = false;
      }
    },
  },
});
