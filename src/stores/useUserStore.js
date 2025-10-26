import { defineStore } from 'pinia';
import api from '@/services/apiServices';

function normalizeRole(entry = {}) {
  if (!entry) return null;
  const id = entry.id || entry.slug || entry.code || entry.name;
  const name = entry.name || entry.title || entry.label || 'Role';
  const permissions = Array.isArray(entry.permissions)
    ? entry.permissions.filter(Boolean)
    : [];
  return { id, name, permissions };
}

function normalizeUser(entry = {}) {
  const roles = Array.isArray(entry.roles)
    ? entry.roles.map((role) => normalizeRole(role)).filter(Boolean)
    : [];

  const aggregatedPermissions = Array.isArray(entry.permissions)
    ? entry.permissions.filter(Boolean)
    : roles.flatMap((role) => role.permissions || []);

  const createdAt = entry.created_at || entry.createdAt || entry.created || '';
  const updatedAt = entry.updated_at || entry.updatedAt || entry.updated || '';
  const lastLoginAt =
    entry.last_login_at || entry.lastLoginAt || entry.lastSeen || '';

  const phoneNumber = entry.phone_number || entry.phone || entry.phoneNumber || '';
  const employmentIdentityNumber =
    entry.employment_identity_number || entry.employmentIdentityNumber || '';

  const isActive =
    entry.is_active ??
    entry.active ??
    (entry.status ? entry.status === 'active' : null) ??
    (entry.deleted_at ? false : true);

  return {
    id: entry.id || `user-${Math.random().toString(36).slice(2, 10)}`,
    name: entry.name || entry.full_name || 'Pengguna',
    email: entry.email || entry.username || '',
    phone: phoneNumber,
    phoneNumber,
    avatar: entry.avatar_url || entry.avatar || null,
    employmentIdentityNumber,
    roles,
    roleNames: roles.length ? roles.map((r) => r.name).join(', ') : '-',
    permissions: aggregatedPermissions,
    isActive,
    createdAt,
    updatedAt,
    lastLoginAt,
  };
}

function buildUserQuery({
  page,
  perPage,
  search,
  roleId,
  status,
} = {}) {
  const query = new URLSearchParams();
  if (page) query.set('page', page);
  if (perPage) query.set('per_page', perPage);
  if (search) query.set('search', search);
  if (roleId) query.set('role_id', roleId);
  if (status) query.set('status', status);
  ['roles', 'roles.permissions'].forEach((include) =>
    query.append('include', include)
  );
  return query.toString();
}

function buildUserFormData(payload = {}) {
  const formData = new FormData();
  const appendIfFilled = (key, value, { allowEmptyString = false } = {}) => {
    if (value === undefined || value === null) return;
    if (!allowEmptyString && typeof value === 'string' && value.trim() === '') return;
    formData.append(key, value);
  };

  appendIfFilled('name', payload.name);
  appendIfFilled('email', payload.email);
  if (payload.password !== undefined) {
    appendIfFilled('password', payload.password, { allowEmptyString: true });
  }

  const phoneNumber =
    payload.phone_number ?? payload.phoneNumber ?? payload.phone ?? null;
  appendIfFilled('phone_number', phoneNumber);

  appendIfFilled(
    'employment_identity_number',
    payload.employment_identity_number ?? payload.employmentIdentityNumber
  );

  const rawRoleIds = Array.isArray(payload.role_ids)
    ? payload.role_ids
    : Array.isArray(payload.roles)
    ? payload.roles
    : payload.role_id
    ? [payload.role_id]
    : [];
  rawRoleIds
    .map((role) => (typeof role === 'object' ? role.id : role))
    .filter(Boolean)
    .forEach((roleId) => formData.append('role_id', roleId));

  if (payload.is_active !== undefined || payload.isActive !== undefined) {
    const isActive = payload.is_active ?? payload.isActive;
    formData.append('is_active', isActive ? 'true' : 'false');
  }

  return formData;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
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
    filters: {
      search: '',
      roleId: '',
      status: '',
    },
  }),

  getters: {
    roleOptions(state) {
      const map = new Map();
      state.users.forEach((user) => {
        user.roles.forEach((role) => {
          if (!map.has(role.id)) map.set(role.id, role);
        });
      });
      return Array.from(map.values());
    },
  },

  actions: {
    async fetchUsers(params = {}) {
      this.loading = true;
      const page = params.page ?? this.pagination.currentPage;
      const perPage = params.perPage ?? this.pagination.perPage;
      const search = params.search ?? this.filters.search ?? '';
      const roleId = params.roleId ?? this.filters.roleId ?? '';
      const status = params.status ?? this.filters.status ?? '';

      try {
        const query = buildUserQuery({
          page,
          perPage,
          search,
          roleId,
          status,
        });
        const endpoint = query ? `/api/v1/users?${query}` : '/api/v1/users';
        const response = await api.get(endpoint);

        const payload = response.data?.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeUser(item))
          : [];

        this.users = items;
        this.pagination = {
          currentPage: payload.current_page ?? page,
          perPage: payload.per_page ?? perPage,
          lastPage: payload.last_page ?? payload.total_pages ?? payload.next_page ?? page,
          totalItems: payload.total_items ?? payload.total ?? items.length,
          hasNextPage: payload.has_next_page ?? Boolean(payload.next_page),
          hasPrevPage: payload.has_prev_page ?? Boolean(payload.prev_page),
        };
        this.error = null;
      } catch (err) {
        console.error('[UserStore] Gagal memuat data dari API', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat data pengguna dari API.';
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      await this.fetchUsers();
    },

    async changePage(page) {
      if (page < 1 || page === this.pagination.currentPage) return;
      await this.fetchUsers({ page });
    },

    setSearch(value) {
      this.filters.search = value;
    },

    setRoleFilter(roleId) {
      this.filters.roleId = roleId;
    },

    setStatusFilter(status) {
      this.filters.status = status;
    },

    async createUser(payload) {
      this.saving = true;
      try {
        const body = buildUserFormData(payload);
        const response = await api.post('/api/v1/users', body);
        const apiData = response.data?.data ?? response.data;
        const created = normalizeUser(apiData?.user ?? apiData);
        if (this.pagination.currentPage === 1) {
          this.users = [created, ...this.users.filter((u) => u.id !== created.id)];
        }
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true, data: created };
      } catch (err) {
        console.error('[UserStore] API create user gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menambahkan pengguna.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async updateUser(id, payload) {
      this.saving = true;
      try {
        const body = buildUserFormData(payload);
        const response = await api.put(`/api/v1/users/${id}`, body);
        const apiData = response.data?.data ?? response.data;
        const updated = normalizeUser(apiData?.user ?? apiData);
        const idx = this.users.findIndex((user) => user.id === id);
        if (idx !== -1) this.users[idx] = updated;
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true, data: updated };
      } catch (err) {
        console.error('[UserStore] API update user gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memperbarui pengguna.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async removeUser(id) {
      this.saving = true;
      try {
        await api.delete(`/api/v1/users/${id}`);
        this.users = this.users.filter((user) => user.id !== id);
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true };
      } catch (err) {
        console.error('[UserStore] API delete user gagal', err);
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus pengguna.';
        throw err;
      } finally {
        this.saving = false;
      }
    },

    async toggleActive(id, isActive) {
      return this.updateUser(id, { is_active: isActive });
    },
  },
});
