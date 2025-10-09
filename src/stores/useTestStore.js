// src/stores/useTestStore.js
import { defineStore } from 'pinia';

/**
 * Store untuk layanan & tarif:
 * - tests: daftar jenis pengujian (nama, tarif, metode, mesin)
 * - machines: daftar mesin uji
 * - methods: daftar metode uji
 */
export const useTestStore = defineStore('test', {
  state: () => ({
    tests: [
      { id: 1, name: 'Kadar Air', price: 50000, method: 'Gravimetri', equipment: 'Oven' },
      { id: 2, name: 'pH',       price: 30000, method: 'Potensiometri', equipment: 'pH Meter' },
      { id: 3, name: 'Protein',  price: 70000, method: 'Kjeldahl',      equipment: 'Kjeltec' },
    ],
    machines: ['Universal Testing Machine', 'Oven', 'pH Meter'],   // ← pindahan dari page
    methods:  ['SNI 1974:2011', 'ASTM C39/C39M', 'ISO 527-1'],     // ← pindahan dari page
  }),

  getters: {
    // Contoh: cari test by id
    getTestById: (state) => (id) => state.tests.find(t => t.id === id),
  },

  actions: {
    // ===== Tests =====
    addTest(payload) {
      // payload: { name, price, method, equipment }
      if (!payload?.name || !payload?.method || !payload?.equipment) return;
      const nextId = this.tests.length ? Math.max(...this.tests.map(t => t.id)) + 1 : 1;
      this.tests.push({
        id: nextId,
        name: payload.name,
        price: Number(payload.price) || 0,
        method: payload.method,
        equipment: payload.equipment,
      });
    },
    removeTest(id) {
      const idx = this.tests.findIndex(t => t.id === id);
      if (idx !== -1) this.tests.splice(idx, 1);
    },

    // ===== Machines =====
    addMachine(name) {
      const v = (name || '').trim();
      if (!v) return;
      this.machines.push(v);
    },
    removeMachine(index) {
      this.machines.splice(index, 1);
    },

    // ===== Methods =====
    addMethod(name) {
      const v = (name || '').trim();
      if (!v) return;
      this.methods.push(v);
    },
    removeMethod(index) {
      this.methods.splice(index, 1);
    },
  },
});
