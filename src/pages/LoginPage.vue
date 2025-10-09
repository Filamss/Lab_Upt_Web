<template>
  <div
    class="min-h-screen flex items-center justify-center bg-cover bg-center animate-fadeIn"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
  >
    <div
      class="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg w-96 border border-gray-200"
    >
      <h2 class="text-2xl font-semibold text-center mb-6 text-primaryDark">
        Login
      </h2>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="Masukkan email"
            class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Masukkan password"
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              <svg
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0112 4.5c4.478 0 8.268 2.943 9.802 7.023a10.52 10.52 0 01-1.28 2.243m-2.21 2.46A10.451 10.451 0 0112 19.5a10.451 10.451 0 01-6.803-2.774m-2.22-2.46A10.522 10.522 0 013.98 8.223"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>

              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 0112 4.5c4.478 0 8.268 2.943 9.802 7.023a10.52 10.52 0 01-1.28 2.243m-2.21 2.46A10.451 10.451 0 0112 19.5a10.451 10.451 0 01-6.803-2.774m-2.22-2.46A10.522 10.522 0 013.98 8.223"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-gradient-to-r from-primaryLight to-primaryDark text-white font-semibold py-2 rounded-lg mt-4 hover:opacity-90 transition disabled:opacity-60"
        >
          <span v-if="!authStore.loading">Login</span>
          <span v-else>Loading...</span>
        </button>
      </form>

      <p
        v-if="errorMessage"
        class="text-center text-sm text-red-600 mt-3 font-medium"
      >
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import backgroundImage from '@/assets/bg-login.jpg';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const showPassword = ref(false);

// gunakan authStore.login(email,password). store menyediakan fallback dev jika backend tidak ada
async function handleLogin() {
  errorMessage.value = '';
  const res = await authStore.login({
    email: email.value,
    password: password.value,
  });
  if (res.ok) {
    router.push('/dashboard');
  } else {
    errorMessage.value = res.message || 'Username atau password salah!';
  }
}
</script>

<style scoped>
/* efek blur dan kontras di background */
.bg-overlay {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
}
</style>
