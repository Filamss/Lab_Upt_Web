import { defineStore } from 'pinia';
import api from '@/services/apiServices';

function normalizeRole(entry = {}) {
  if (!entry) return null;
  const id = entry.id || entry.slug || entry.code || entry.name;
  const name = entry.name || entry.title || entry.label || 'Role';
  return { id, name };
}

function normalizeUser(entry = {}) {
  const roles = Array.isArray(entry.roles)
    ? entry.roles.map((role) => normalizeRole(role)).filter(Boolean)
    : [];

  const permissions = Array.isArray(entry.permissions)
    ? entry.permissions.filter(Boolean)
    : [];

  const isActive =
    entry.is_active ?? entry.active ?? entry.status === 'active' ?? true;

  const createdAt = entry.created_at || entry.createdAt || entry.created || '';
  const updatedAt = entry.updated_at || entry.updatedAt || entry.updated || '';
  const lastLoginAt =
    entry.last_login_at || entry.lastLoginAt || entry.lastSeen || '';

  return {
    id: entry.id || `user-${Math.random().toString(36).slice(2, 10)}`,
    name: entry.name || entry.full_name || 'Pengguna',
    email: entry.email || entry.username || '',
    phone: entry.phone || entry.phoneNumber || '',
    avatar: entry.avatar_url || entry.avatar || null,
    roles,
    roleNames: roles.length ? roles.map((r) => r.name).join(', ') : '-',
    permissions,
    isActive,
    createdAt,
    updatedAt,
    lastLoginAt,
  };
}

const fallbackUsers = [
  {
    id: '01K7P7CE5SSS6G0HAZK18CH3YB',
    name: 'Eka Putri Hartati',
    email: 'eka@uptlab.id',
    phone: '0812-3344-5566',
    roles: [{ id: 'super-admin', name: 'Super Admin' }],
    permissions: ['manage_users', 'manage_roles', 'view_reports'],
    is_active: true,
    created_at: '2025-10-12T09:15:00+07:00',
    last_login_at: '2025-10-22T08:10:00+07:00',
  },
  {
    id: '01K7P7CE66ZFN9W5STTBS9V3RT',
    name: 'Dewi Anggraeni',
    email: 'dewi@uptlab.id',
    phone: '0813-7788-9900',
    roles: [{ id: 'head', name: 'Head' }],
    permissions: ['approve_request', 'view_reports'],
    is_active: true,
    created_at: '2025-09-28T14:45:00+07:00',
    last_login_at: '2025-10-21T16:48:00+07:00',
  },
  {
    id: '01K7P7CE6J0A4K9ZJ7SH6M2H3F',
    name: 'Bima Adyatama',
    email: 'bima@uptlab.id',
    phone: '0819-2233-1100',
    roles: [
      { id: 'technician', name: 'Teknisi' },
      { id: 'lab-assistant', name: 'Asisten Lab' },
    ],
    permissions: ['update_testing_progress'],
    is_active: false,
    created_at: '2025-08-11T08:05:00+07:00',
    last_login_at: '2025-10-02T11:22:00+07:00',
  },
];

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
        const response = await api.get('/api/v1/users', {
          params: {
            page,
            per_page: perPage,
            search: search || undefined,
            role_id: roleId || undefined,
            status: status || undefined,
          },
        });

        const payload = response.data?.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => normalizeUser(item))
          : [];

        if (!items.length && !this.users.length) {
          // fallback to dummy only when API returns empty and state empty
          this.users = fallbackUsers.map((item) => normalizeUser(item));
          this.pagination = {
            currentPage: 1,
            perPage: fallbackUsers.length,
            lastPage: 1,
            totalItems: fallbackUsers.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
          this.error =
            'Dummy mode aktif: API /api/v1/users belum tersedia, menampilkan data contoh.';
        } else {
          this.users = items;
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
        console.warn('[UserStore] Gagal memuat data dari API, menggunakan dummy', err);
        this.users = fallbackUsers.map((item) => normalizeUser(item));
        this.pagination = {
          currentPage: 1,
          perPage: fallbackUsers.length,
          lastPage: 1,
          totalItems: fallbackUsers.length,
          hasNextPage: false,
          hasPrevPage: false,
        };
        this.error =
          'Dummy mode aktif: API /api/v1/users belum tersedia, menampilkan data contoh.';
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
        const response = await api.post('/api/v1/users', payload);
        const created = normalizeUser(response.data?.data ?? response.data);
        if (this.pagination.currentPage === 1) {
          this.users = [created, ...this.users.filter((u) => u.id !== created.id)];
        }
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true, data: created };
      } catch (err) {
        console.warn('[UserStore] API create user gagal, simpan dummy', err);
        const created = normalizeUser({
          ...payload,
          id: `temp-${Date.now()}`,
          roles: Array.isArray(payload.roles)
            ? payload.roles.map((roleId) => normalizeRole({ id: roleId, name: roleId }))
            : [],
          permissions: payload.permissions || [],
          is_active: payload.isActive ?? true,
          created_at: new Date().toISOString(),
        });
        this.users = [created, ...this.users];
        this.pagination.totalItems += 1;
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, data: created, dummy: true };
      } finally {
        this.saving = false;
      }
    },

    async updateUser(id, payload) {
      this.saving = true;
      try {
        const response = await api.put(`/api/v1/users/${id}`, payload);
        const updated = normalizeUser(response.data?.data ?? response.data);
        const idx = this.users.findIndex((user) => user.id === id);
        if (idx !== -1) this.users[idx] = updated;
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true, data: updated };
      } catch (err) {
        console.warn('[UserStore] API update user gagal, simpan dummy', err);
        const idx = this.users.findIndex((user) => user.id === id);
        if (idx !== -1) {
          this.users[idx] = normalizeUser({
            ...this.users[idx],
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

    async removeUser(id) {
      this.saving = true;
      try {
        await api.delete(`/api/v1/users/${id}`);
        this.users = this.users.filter((user) => user.id !== id);
        await this.fetchUsers({ page: this.pagination.currentPage });
        return { ok: true };
      } catch (err) {
        console.warn('[UserStore] API delete user gagal, hapus dummy', err);
        this.users = this.users.filter((user) => user.id !== id);
        this.pagination.totalItems = Math.max(0, this.pagination.totalItems - 1);
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, dummy: true };
      } finally {
        this.saving = false;
      }
    },

    async toggleActive(id, isActive) {
      try {
        await api.patch(`/api/v1/users/${id}/status`, { is_active: isActive });
        const idx = this.users.findIndex((user) => user.id === id);
        if (idx !== -1) this.users[idx].isActive = isActive;
        return { ok: true };
      } catch (err) {
        console.warn('[UserStore] API toggle status gagal, ubah dummy', err);
        const idx = this.users.findIndex((user) => user.id === id);
        if (idx !== -1) this.users[idx].isActive = isActive;
        this.error =
          'Dummy mode aktif: perubahan hanya tersimpan lokal karena API belum tersedia.';
        return { ok: true, dummy: true };
      }
    },
  },
});
