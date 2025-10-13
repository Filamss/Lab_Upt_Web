<template>
  <div class="min-h-screen flex bg-muted">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-surface text-gray-800 transition-all duration-300 ease-in-out overflow-y-auto',
        collapsed ? 'w-16' : 'w-64',
      ]"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between h-16 px-4 border-b border-border"
      >
        <span class="font-bold text-lg text-primaryDark" v-if="!collapsed">
          SIAPEL
        </span>
        <button
          class="focus:outline-none"
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

      <!-- Navigation -->
      <nav class="mt-4">
        <ul>
          <!-- Dashboard -->
          <li>
            <router-link
              to="/Dashboard"
              class="flex items-center gap-3 p-3 rounded-md hover:bg-primaryLight hover:text-white mx-2 mb-2"
              :class="{
                'bg-gradient-to-r from-primaryLight to-primaryDark text-white':
                  route.path === '/Dashboard',
              }"
            >
              <HomeIcon class="w-5 h-5" />
              <span v-if="!collapsed">Dashboard</span>
            </router-link>
          </li>

          <!-- Dropdown Groups -->
          <li v-for="group in groupedMenu" :key="group.label" class="mb-2">
            <button
              class="flex items-center justify-between w-[calc(100%-1rem)] px-3 py-3 rounded-md mx-2 mb-1 hover:bg-primaryLight hover:text-white"
              :class="{
                'bg-gradient-to-r from-primaryLight to-primaryDark text-white':
                  openGroup === group.label,
              }"
              @click="toggleGroup(group.label)"
            >
              <div class="flex items-center gap-3">
                <component :is="group.icon" class="w-5 h-5" />
                <span v-if="!collapsed">{{ group.label }}</span>
              </div>
              <svg
                v-if="!collapsed"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 transform transition-transform duration-200"
                :class="{ 'rotate-90': openGroup === group.label }"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>

            <!-- Submenu -->
            <transition name="fade">
              <ul v-if="openGroup === group.label" class="pl-4 pr-3">
                <li v-for="child in group.children" :key="child.path">
                  <router-link
                    :to="child.path"
                    class="flex items-center gap-3 p-3 rounded-md hover:bg-primaryLight hover:text-white mx-2 mb-2 w-[calc(100%-0.5rem)]"
                    :class="{
                      'bg-gradient-to-r from-primaryLight to-primaryDark text-white':
                        route.path === child.path,
                    }"
                  >
                    <component :is="child.icon" class="w-5 h-5" />
                    <span v-if="!collapsed">{{ child.label }}</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>

      <div class="mt-auto border-t border-border p-3">
        <!-- Profile -->
        <router-link
          to="/profile"
          class="flex items-center justify-start gap-3 p-3 rounded-md hover:bg-primaryLight hover:text-white mx-1 mb-2 transition-all duration-200"
          :class="{ 'justify-center': collapsed }"
        >
          <IdentificationIcon class="w-6 h-6 shrink-0" />
          <span v-if="!collapsed">Profile</span>
        </router-link>

        <!-- Logout -->
        <button
          @click="logout"
          class="flex items-center justify-start gap-3 p-3 rounded-md hover:bg-danger hover:text-white mx-1 mb-2 w-[calc(100%-0.5rem)] transition-all duration-200"
          :class="{ 'justify-center': collapsed }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25a.75.75 0 00-.75-.75H5.25A.75.75 0 004.5 5.25v13.5a.75.75 0 00.75.75h9.75a.75.75 0 00.75-.75V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          <span v-if="!collapsed">Logout</span>
        </button>
      </div>
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

          <!-- Avatar -->
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
  FolderIcon,
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '@/stores/useAuthStore';

const collapsed = ref(false);
const route = useRoute();
const authStore = useAuthStore();
const openGroup = ref(null);

/**
 * Toggle group so that only one stays open at a time
 */
function toggleGroup(label) {
  if (openGroup.value === label) {
    openGroup.value = null; // close if same clicked
  } else {
    openGroup.value = label; // open new one, close others
  }
}

const groupedMenu = [
  {
    label: 'Pengujian',
    icon: FolderIcon,
    children: [
      {
        label: 'Permintaan',
        path: '/permintaan',
        icon: ClipboardDocumentListIcon,
      },
      { label: 'Kaji Ulang', path: '/kaji-ulang', icon: CheckCircleIcon },
    ],
  },
  {
    label: 'Layanan & Tarif',
    icon: Cog6ToothIcon,
    children: [
      { label: 'Daftar Layanan', path: '/layanan', icon: Cog6ToothIcon },
    ],
  },
  {
    label: 'Cetak',
    icon: BriefcaseIcon,
    children: [
      { label: 'Validasi', path: '/validasi', icon: CheckCircleIcon },
      {
        label: 'Kartu Kendali',
        path: '/kartu-kendali',
        icon: IdentificationIcon,
      },
      { label: 'Surat Perintah', path: '/surat-perintah', icon: BriefcaseIcon },
    ],
  },
  {
    label: 'Laporan',
    icon: ChartBarIcon,
    children: [
      { label: 'Keuangan', path: '/laporan-keuangan', icon: CreditCardIcon },
      {
        label: 'Pengujian',
        path: '/laporan-pengujian',
        icon: ClipboardDocumentListIcon,
      },
    ],
  },
  {
    label: 'User Management',
    icon: UserGroupIcon,
    children: [
      { label: 'Users', path: '/users', icon: UserGroupIcon },
      { label: 'Roles', path: '/roles', icon: Cog6ToothIcon },
      { label: 'Permissions', path: '/permissions', icon: Cog6ToothIcon },
    ],
  },
];

const pageTitle = computed(() => {
  const activeChild = groupedMenu
    .flatMap((g) => g.children)
    .find((i) => i.path === route.path);
  return activeChild
    ? activeChild.label
    : route.path.replace('/', '') || 'Dashboard';
});

function logout() {
  const authStore = useAuthStore();
  authStore.logout(); // kalau di store kamu ada method logout
  window.location.href = '/login';
}
</script>

<style scoped>
aside::-webkit-scrollbar {
  display: none;
}

/* Animasi dropdown */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
