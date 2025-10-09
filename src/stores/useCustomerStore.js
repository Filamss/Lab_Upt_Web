import { defineStore } from 'pinia';

/**
 * Store for managing customer data.  This is a simple collection
 * of customers with name and address information.  Real
 * applications would likely handle pagination, search and remote
 * persistence here.
 */
export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [
      { id: 1, name: 'PT. Sumber Pangan', address: 'Jl. Raya No 1, Tegal' },
      { id: 2, name: 'UD. Maju Lancar', address: 'Jl. Sudirman No 10, Tegal' },
      { id: 3, name: 'CV. Teknologi Hijau', address: 'Jl. Kartini No 20, Slawi' },
    ],
  }),
});