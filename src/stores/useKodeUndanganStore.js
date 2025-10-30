import { defineStore } from 'pinia';
import api from '@/services/apiServices';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function normalizeKodeUndangan(entry = {}) {
  const code =
    entry.code ||
    entry.invitation_code ||
    entry.token ||
    entry.key ||
    `INV-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const usageLimit =
    entry.usage_limit ??
    entry.usageLimit ??
    entry.max_use ??
    entry.maxUse ??
    entry.maxUsage ??
    null;

  const usedCount =
    entry.used_count ??
    entry.usedCount ??
    entry.usage_count ??
    entry.usageCount ??
    0;

  const status =
    entry.status ||
    (entry.revoked
      ? 'revoked'
      : entry.active === false
      ? 'inactive'
      : 'active');

  return {
    id: entry.id || entry.ulid || code,
    code,
    usageLimit,
    usedCount,
    status,
    note: entry.note || entry.description || '',
    expiresAt: entry.expires_at || entry.expiresAt || entry.expired_at || null,
    createdAt:
      entry.created_at || entry.createdAt || entry.created || new Date().toISOString(),
    createdBy:
      entry.created_by ||
      entry.createdBy ||
      entry.owner ||
      entry.issued_by ||
      null,
    roleId:
      entry.role_id ||
      entry.roleId ||
      entry.role_id_default ||
      entry.role?.id ||
      entry.role ||
      null,
    roleName:
      entry.role_name ||
      entry.roleName ||
      entry.role?.name ||
      entry.role_label ||
      '',
  };
}

function createLocalKodeUndangan(payload = {}) {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + ONE_DAY_MS).toISOString();
  return normalizeKodeUndangan({
    code:
      payload.code ||
      `INV-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now()
        .toString()
        .slice(-4)}`,
    usage_limit: 1,
    role_id: payload.role_id ?? payload.roleId ?? null,
    role_name: payload.role_name ?? payload.roleName ?? payload.role_label ?? '',
    expires_at: expiresAt,
    created_at: createdAt.toISOString(),
    note: '[dummy] kode undangan (API belum aktif)',
  });
}

function isExpired(entry) {
  const exp = new Date(entry.expiresAt || entry.createdAt);
  if (Number.isNaN(exp.getTime())) return false;
  return exp.getTime() < Date.now();
}

export const useKodeUndanganStore = defineStore('kodeUndangan', {
  state: () => ({
    codes: [],
    loading: false,
    saving: false,
    error: null,
  }),

  getters: {
    pendingOrActive(state) {
      return state.codes.filter((item) => item.status !== 'revoked');
    },
  },

  actions: {
    async fetchKodeUndangan() {
      this.loading = true;
      try {
        const response = await api.get('/api/v1/invitations');
        const payload = response.data?.data ?? response.data ?? {};
        const items = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : [];
        const normalized = items.map((entry) => normalizeKodeUndangan(entry));
        this.codes = normalized.filter((entry) => !isExpired(entry));
        this.error = null;
      } catch (err) {
        console.warn('[KodeUndanganStore] API belum tersedia, gunakan data dummy.', err);
        this.codes = [
          createLocalKodeUndangan({
            code: 'INV-ADMIN-001',
            usage_limit: 1,
            expires_at: new Date(Date.now() + ONE_DAY_MS).toISOString(),
            role_name: 'Administrator',
          }),
          createLocalKodeUndangan({
            code: 'INV-SUPERVISOR-001',
            usage_limit: 1,
            expires_at: new Date(Date.now() + ONE_DAY_MS).toISOString(),
            role_name: 'Supervisor',
          }),
        ];
        this.codes = this.codes.filter((entry) => !isExpired(entry));
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal memuat data kode undangan dari API.';
      } finally {
        this.loading = false;
      }
    },

    async refresh() {
      await this.fetchKodeUndangan();
    },

    async generateKodeUndangan(payload = {}) {
      this.saving = true;
      try {
        const expiresAt =
          payload.expires_at ?? new Date(Date.now() + ONE_DAY_MS).toISOString();
        const usageLimit = payload.usage_limit ?? 1;
        const response = await api.post('/api/v1/invitations', {
          usage_limit: usageLimit,
          expires_at: expiresAt,
          role_id: payload.role_id ?? payload.roleId ?? null,
          note: payload.note ?? payload.description ?? null,
        });
        const data = response.data?.data ?? response.data ?? {};
        const created = normalizeKodeUndangan(data);
        this.codes = [created, ...this.codes.filter((item) => item.id !== created.id)].filter(
          (entry) => !isExpired(entry)
        );
        this.error = null;
        return { ok: true, data: created };
      } catch (err) {
        console.warn('[KodeUndanganStore] API generate gagal, fallback dummy.', err);
        const created = createLocalKodeUndangan(payload);
        this.codes = [created, ...this.codes].filter((entry) => !isExpired(entry));
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal membuat kode undangan melalui API, menggunakan data dummy.';
        return { ok: true, data: created, dummy: true };
      } finally {
        this.saving = false;
      }
    },

    async deleteKodeUndangan(id) {
      this.saving = true;
      try {
        await api.delete(`/api/v1/invitations/${id}`);
        this.codes = this.codes.filter((item) => item.id !== id);
        this.codes = this.codes.filter((entry) => !isExpired(entry));
        this.error = null;
        return { ok: true };
      } catch (err) {
        console.warn('[KodeUndanganStore] API delete gagal, hapus lokal.', err);
        this.codes = this.codes.filter((item) => item.id !== id);
        this.codes = this.codes.filter((entry) => !isExpired(entry));
        this.error =
          err.response?.data?.message ||
          err.message ||
          'Gagal menghapus kode undangan melalui API, data lokal dihapus.';
        return { ok: true, dummy: true };
      } finally {
        this.saving = false;
      }
    },
  },
});
