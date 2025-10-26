import { defineStore } from 'pinia';

const STORAGE_KEY = 'uptlab.activityHistory';
const MAX_EVENTS = 200;

function safeParse(json, fallback = []) {
  try {
    return JSON.parse(json) ?? fallback;
  } catch (err) {
    console.warn('[ActivityStore] gagal parsing riwayat', err);
    return fallback;
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `act-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeEvent(entry = {}) {
  return {
    id: entry.id || createId(),
    type: entry.type || 'system',
    title: entry.title || 'Aktivitas',
    description: entry.description || '-',
    status: entry.status || 'info',
    referenceId: entry.referenceId || null,
    metadata: entry.metadata || {},
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

export const useActivityStore = defineStore('activity', {
  state: () => ({
    events:
      typeof window !== 'undefined'
        ? safeParse(window.localStorage?.getItem(STORAGE_KEY) || '[]')
        : [],
    loading: false,
  }),

  getters: {
    stats(state) {
      return state.events.reduce(
        (acc, event) => {
          acc.total += 1;
          if (event.type === 'login') acc.login += 1;
          else if (event.type === 'request') acc.request += 1;
          else if (event.type === 'payment') acc.payment += 1;
          else acc.system += 1;
          return acc;
        },
        { total: 0, login: 0, request: 0, payment: 0, system: 0 }
      );
    },
  },

  actions: {
    hydrate() {
      if (typeof window === 'undefined') return;
      this.events = safeParse(window.localStorage?.getItem(STORAGE_KEY) || '[]');
    },

    persist() {
      if (typeof window === 'undefined') return;
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(this.events));
    },

    addEvent(payload = {}) {
      const event = normalizeEvent(payload);
      this.events = [event, ...this.events]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, MAX_EVENTS);
      this.persist();
      return event;
    },

    importEvents(list = []) {
      const normalized = list.map((item) => normalizeEvent(item));
      const combined = [...normalized, ...this.events];
      const uniqueMap = new Map();
      combined.forEach((item) => {
        uniqueMap.set(item.id, item);
      });
      this.events = Array.from(uniqueMap.values())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, MAX_EVENTS);
      this.persist();
    },

    clear() {
      this.events = [];
      this.persist();
    },
  },
});
