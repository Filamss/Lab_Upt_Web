import { defineStore } from 'pinia';

/**
 * Store for managing users and their roles.  Roles include
 * Admin Penerima, Manajer Teknis, Penyelia, Teknisi, and Super Admin.
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    // Sample users for development. Passwords are plain-text only for local dev/testing.
    users: [
      {
        id: 1,
        name: 'Eka',
        role: 'Super Admin',
        email: 'eka@example.com',
        password: 'password1',
        active: true,
      },
    ],
  }),
});
