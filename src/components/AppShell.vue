<template>
  <div class="min-h-screen flex bg-muted">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-surface text-gray-800 transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      ]"
    >
      <div
        class="flex items-center justify-between h-16 px-4 border-b border-border"
      >
        <span class="font-bold text-lg text-primaryDark" v-if="!collapsed">
          SIAPEL
        </span>
        <button
          class="text-gradient-to-r from-primaryLight to-primaryDark focus:outline-none"
          @click="collapsed = !collapsed"
          title="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5"
            />
          </svg>
        </button>
      </div>
      <nav class="mt-4">
        <ul>
          <li v-for="item in navItems" :key="item.path">
            <router-link
              :to="item.path"
              class="flex items-center gap-3 p-3 rounded-md hover:bg-primaryLight hover:text-white mx-2 mb-2"
              :class="{
                'bg-gradient-to-r from-primaryLight to-primaryDark text-white':
                  route.path === item.path,
              }"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span v-if="!collapsed">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- Main content area -->
    <div class="flex-1 flex flex-col">
      <!-- Top navbar -->
      <header
        class="bg-gradient-to-r from-primaryLight to-primaryDark text-white border-b border-border h-16 flex justify-between items-center px-4"
      >
        <h1 class="text-xl font-semibold text-surface">
          {{ pageTitle }}
        </h1>
        <div class="flex items-center gap-4 px-6">
          <span class="hidden sm:block text-gray-100">
            {{ authStore.currentUser?.name || 'Guest' }}
          </span>

          <!-- Avatar jadi link ke profile -->
          <router-link to="/profile" title="My Profile">
            <img
              :src="userAvatar"
              alt="Profile"
              class="w-8 h-8 rounded-full ring-2 ring-white cursor-pointer hover:opacity-80 transition"
            />
          </router-link>
        </div>
      </header>

      <!-- Page content -->
      <!-- Menggunakan lebar penuh untuk area konten utama tanpa membatasi max width.
           Padding horizontal diatur secara responsif: px-4 pada layar kecil, sm:px-6 pada lebar ≥640px,
           dan lg:px-8 pada lebar ≥1024px. -->
      <main class="flex-1 overflow-y-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  IdentificationIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/useAuthStore';

const collapsed = ref(false);
const route = useRoute();
const authStore = useAuthStore();

const navByRole = {
  'Super Admin': [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    {
      path: '/kaji-ulang',
      label: 'Kaji Ulang',
      icon: ClipboardDocumentListIcon,
    },
    { path: '/validasi', label: 'Validasi', icon: CheckCircleIcon },
    {
      path: '/kartu-kendali',
      label: 'Kartu Kendali',
      icon: IdentificationIcon,
    },
    { path: '/surat-perintah', label: 'Surat Perintah', icon: BriefcaseIcon },
    { path: '/layanan', label: 'Layanan & Tarif', icon: Cog6ToothIcon },
    { path: '/keuangan', label: 'Keuangan', icon: CreditCardIcon },
    { path: '/laporan', label: 'Laporan', icon: ChartBarIcon },
    { path: '/users', label: 'Users', icon: UserGroupIcon },
    { path: '/profile', label: 'Profile', icon: IdentificationIcon },
  ],
  'Admin Penerima': [
    { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    {
      path: '/kaji-ulang',
      label: 'Kaji Ulang',
      icon: ClipboardDocumentListIcon,
    },
    { path: '/keuangan', label: 'Keuangan', icon: CreditCardIcon },
  ],
};

const navItems = computed(() => {
  const role = authStore.currentUser?.role;
  return navByRole[role] || [];
});

const pageTitle = computed(() => {
  const item = navItems.value.find((i) => i.path === route.path);
  return item ? item.label : route.path.replace('/', '') || 'Dashboard';
});
</script>

<style scoped>
/* Hide scrollbars for the sidebar on smaller screens */
aside::-webkit-scrollbar {
  display: none;
}
</style>
