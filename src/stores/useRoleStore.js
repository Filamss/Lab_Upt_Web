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

function buildRoleQuery({ page, perPage, search } = {}) {
  const query = new URLSearchParams();
  if (page) query.set('page', page);
  if (perPage) query.set('per_page', perPage);
  if (search) query.set('search', search);
  ['permissions', 'users'].forEach((include) => query.append('include', include));
  return query.toString();
}

function buildRoleFormData(payload = {}) {
  const formData = new FormData();
  if (payload.name) formData.append('name', payload.name);
  if (payload.description) formData.append('description', payload.description);

  const permissionIds = (
    Array.isArray(payload.permission_ids)
      ? payload.permission_ids
      : Array.isArray(payload.permissions)
      ? payload.permissions
      : payload.permission_id
      ? [payload.permission_id]
      : []
  )
    .map((permission) => (typeof permission === 'object' ? permission.id : permission))
    .filter(Boolean);

  permissionIds.forEach((permissionId) => formData.append('permission_id', permissionId));

  return formData;
}

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
        const query = buildRoleQuery({ page, perPage, search });
        const endpoint = query ? `/api/v1/roles?${query}` : '/api/v1/roles';
        const response = await api.get(endpoint);

        const payload = response.data?.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeRole(item))
          : [];

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
      } catch (err) {
        console.error('[RoleStore] Gagal memuat data dari API', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat data role dari API.';
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
        const body = buildRoleFormData(payload);
        const response = await api.post('/api/v1/roles', body);
        const apiData = response.data?.data ?? response.data;
        const created = normalizeRole(apiData?.role ?? apiData);
        if (this.pagination.currentPage === 1) {
          this.roles = [created, ...this.roles.filter((role) => role.id !== created.id)];
        }
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true, data: created };
      } catch (err) {
        console.error('[RoleStore] API create role gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menambahkan role.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async updateRole(id, payload) {
      this.saving = true;
      try {
        const body = buildRoleFormData(payload);
        const response = await api.put(`/api/v1/roles/${id}`, body);
        const apiData = response.data?.data ?? response.data;
        const updated = normalizeRole(apiData?.role ?? apiData);
        const idx = this.roles.findIndex((role) => role.id === id);
        if (idx !== -1) this.roles[idx] = updated;
        await this.fetchRoles({ page: this.pagination.currentPage });
        return { ok: true, data: updated };
      } catch (err) {
        console.error('[RoleStore] API update role gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui role.';
        throw err;
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
        console.error('[RoleStore] API delete role gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus role.';
        throw err;
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
        console.error('[RoleStore] API assign permissions gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui permission role.';
        throw err;
      }
    },
  },
});
