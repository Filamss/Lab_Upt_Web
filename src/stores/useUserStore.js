import { defineStore } from 'pinia';

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
