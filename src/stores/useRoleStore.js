import { defineStore } from 'pinia';
import api from '@/services/apiServices';

function normalizePermission(entry = {}) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    return {
      id: entry,
      name: entry
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
      identifier: entry,
    };
  }

  const id = entry.id || entry.identifier || entry.code || entry.slug || entry.name;
  const name = entry.name || entry.title || entry.label || id || 'Permission';
  const category = entry.category || entry.module || 'general';
  return {
    id,
    name,
    identifier: entry.identifier || id,
    category,
    description: entry.description || '',
  };
}

function normalizeRole(entry = {}) {
  const permissions = Array.isArray(entry.permissions)
    ? entry.permissions.map((perm) => normalizePermission(perm)).filter(Boolean)
    : [];

  const userCount = Array.isArray(entry.users)
    ? entry.users.length
    : Number(entry.user_count ?? entry.users_count ?? entry.users ?? 0);

  return {
    id: entry.id || entry.slug || entry.name,
    name: (entry.name || 'Role').replace(/\b\w/g, (c) => c.toUpperCase()),
    description: entry.description || '',
    permissions,
    userCount,
    permissionCount: entry.permission_count ?? permissions.length,
    createdAt: entry.created_at || entry.createdAt || '',
    updatedAt: entry.updated_at || entry.updatedAt || '',
  };
}

const fallbackRoles = [
  {
    id: '01K7KJ8RYMGS1FWJRZD000TCW0',
    name: 'super admin',
    description: 'Akses penuh ke semua modul dan konfigurasi sistem.',
    permissions: [
      { id: 'manage_users', name: 'Manage Users', category: 'user' },
      { id: 'manage_roles', name: 'Manage Roles', category: 'user' },
      { id: 'view_reports', name: 'View Reports', category: 'report' },
    ],
    user_count: 2,
    created_at: '2025-10-15T16:12:25.813+07:00',
  },
  {
    id: '01K7KJ8RYN8QJMYKA1WQQQYZA6',
    name: 'head',
    description: 'Kepala laboratorium, mengatur penugasan dan persetujuan.',
    permissions: [
      { id: 'approve_request', name: 'Approve Request', category: 'order' },
      { id: 'view_reports', name: 'View Reports', category: 'report' },
      { id: 'update_schedule', name: 'Update Schedule', category: 'operation' },
    ],
    user_count: 3,
    created_at: '2025-10-15T16:12:25.813+07:00',
  },
  {
    id: '01K7ROLELABSUPERVISOR',
    name: 'lab supervisor',
    description: 'Mengawasi progres pengujian dan memastikan kepatuhan.',
    permissions: [
      { id: 'update_testing_progress', name: 'Update Testing Progress', category: 'operation' },
      { id: 'assign_technician', name: 'Assign Technician', category: 'operation' },
    ],
    user_count: 4,
    created_at: '2025-09-20T09:00:00+07:00',
  },
];

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [],
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

  getters: {
    permissionPool(state) {
      const map = new Map();
      state.roles.forEach((role) => {
        role.permissions.forEach((permission) => {
          if (!map.has(permission.id)) map.set(permission.id, permission);
        });
      });
      return Array.from(map.values());
    },
  },

  actions: {
    async fetchRoles(params = {}) {
      this.loading = true;
      const page = params.page ?? this.pagination.currentPage;
      const perPage = params.perPage ?? this.pagination.perPage;
      const search = params.search ?? this.search ?? '';

      try {
        const response = await api.get('/api/v1/roles', {
          params: {
            page,
            per_page: perPage,
            search: search || undefined,
          },
        });

        const payload = response.data?.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeRole(item))
          : [];

        if (!items.length && !this.roles.length) {
          this.roles = fallbackRoles.map((item) => normalizeRole(item));
          this.pagination = {
            currentPage: 1,
            perPage: fallbackRoles.length,
            lastPage: 1,
            totalItems: fallbackRoles.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
          this.error =
            'Dummy mode aktif: API /api/v1/roles belum tersedia, menampilkan data contoh.';
        } else {
          this.roles = items;
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
        console.warn('[RoleStore] Gagal memuat data dari API, menggunakan dummy', err);
        this.roles = fallbackRoles.map((item) => normalizeRole(item));
        this.pagination = {
          currentPage: 1,
          perPage: fallbackRoles.length,
          lastPage: 1,
          totalItems: fallbackRoles.length,
          hasNextPage: false,
          hasPrevPage: false,
        };
        this.error =
          'Dummy mode aktif: API /api/v1/roles belum tersedia, menampilkan data contoh.';
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      await this.fetchRoles();
    },

    async changePage(page) {
      if (page < 1 || page === this.pagination.currentPage) return;
      await this.fetchRoles({ page });
    },

    setSearch(value) {
      this.search = value;
    },

    async createRole(payload) {
      this.saving = true;
      try {
        const response = await api.post('/api/v1/roles', payload);
        const created = normalizeRole(response.data?.data ?? response.data);
        if (this.pagination.currentPage === 1) {
          this.roles = [created, ...this.roles.filter((role) => role.id !== created.id)];
        }
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true, data: created };
      } catch (err) {
        console.warn('[RoleStore] API create role gagal, simpan dummy', err);
        const created = normalizeRole({
          ...payload,
          id: `temp-role-${Date.now()}`,
          permissions: payload.permission_ids || payload.permissions || [],
          created_at: new Date().toISOString(),
        });
        this.roles = [created, ...this.roles];
        this.pagination.totalItems += 1;
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, data: created, dummy: true };
      } finally {
        this.saving = false;
      }
    },

    async updateRole(id, payload) {
      this.saving = true;
      try {
        const response = await api.put(`/api/v1/roles/${id}`, payload);
        const updated = normalizeRole(response.data?.data ?? response.data);
        const idx = this.roles.findIndex((role) => role.id === id);
        if (idx !== -1) this.roles[idx] = updated;
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true, data: updated };
      } catch (err) {
        console.warn('[RoleStore] API update role gagal, simpan dummy', err);
        const idx = this.roles.findIndex((role) => role.id === id);
        if (idx !== -1) {
          const permissions =
            payload.permission_ids || payload.permissions || this.roles[idx].permissions;
          this.roles[idx] = normalizeRole({
            ...this.roles[idx],
            ...payload,
            permissions,
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

    async removeRole(id) {
      this.saving = true;
      try {
        await api.delete(`/api/v1/roles/${id}`);
        this.roles = this.roles.filter((role) => role.id !== id);
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true };
      } catch (err) {
        console.warn('[RoleStore] API delete role gagal, hapus dummy', err);
        this.roles = this.roles.filter((role) => role.id !== id);
        this.pagination.totalItems = Math.max(0, this.pagination.totalItems - 1);
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, dummy: true };
      } finally {
        this.saving = false;
      }
    },

    async assignPermissions(roleId, permissionIds = []) {
      try {
        await api.post(`/api/v1/roles/${roleId}/permissions`, {
          permission_ids: permissionIds,
        });
        const idx = this.roles.findIndex((role) => role.id === roleId);
        if (idx !== -1) {
          this.roles[idx].permissions = permissionIds.map((id) =>
            normalizePermission({ id })
          );
          this.roles[idx].permissionCount = permissionIds.length;
        }
        return { ok: true };
      } catch (err) {
        console.warn('[RoleStore] API assign permissions gagal, update dummy', err);
        const idx = this.roles.findIndex((role) => role.id === roleId);
        if (idx !== -1) {
          this.roles[idx].permissions = permissionIds.map((id) =>
            normalizePermission({ id })
          );
          this.roles[idx].permissionCount = permissionIds.length;
        }
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, dummy: true };
      }
    },
  },
});
