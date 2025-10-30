<template>
  <div class="flex min-h-screen bg-muted items-stretch">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed md:static inset-y-0 left-0 z-50 flex h-screen md:min-h-screen flex-col bg-surface text-gray-800 transition-all duration-300 ease-in-out md:self-stretch shadow-lg md:shadow-none',
        collapsed ? 'w-14 md:w-14' : 'w-60 md:w-56',
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ]"
    >
      <!-- Header -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-border">
        <span v-if="!collapsed" class="font-bold text-lg text-primaryDark">SIAPEL</span>
        <button class="focus:outline-none" @click="toggleCollapse" title="Toggle sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5" />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 flex-1 overflow-y-auto px-1">
        <ul>
          <li>
            <router-link
              to="/dashboard"
              :title="'Dashboard'"
              class="flex items-center gap-3 p-3 rounded-md hover:bg-primaryLight hover:text-white mx-2 mb-2 transition text-left"
              :class="{
                'bg-gradient-to-r from-primaryLight to-primaryDark text-white': route.path === '/dashboard',
                'justify-center': collapsed,
              }"
            >
              <HomeIcon class="w-5 h-5 shrink-0" />
              <span v-if="!collapsed">Dashboard</span>
            </router-link>
          </li>

          <!-- Grouped Menu -->
          <li v-for="group in groupedMenu" :key="group.label" class="mb-2">
            <button
              class="flex items-center justify-between w-[calc(100%-1rem)] px-3 py-3 rounded-md mx-2 hover:bg-primaryLight hover:text-white transition-all duration-200 text-left"
              :class="{
                'bg-gradient-to-r from-primaryLight to-primaryDark text-white': openGroup === group.label,
                'justify-center': collapsed,
              }"
              @click="toggleGroup(group.label)"
            >
              <div class="flex items-center gap-3">
                <component :is="group.icon" class="w-5 h-5 shrink-0" />
                <span v-if="!collapsed">{{ group.label }}</span>
              </div>
              <svg
                v-if="!collapsed"
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 transform transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
                :class="{ 'rotate-90': openGroup === group.label }"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            <transition name="fade">
              <ul v-if="openGroup === group.label" class="pl-4 pr-3 mt-1">
                <li v-for="child in group.children" :key="child.path">
                  <router-link
                    :to="child.path"
                    :title="collapsed ? child.label : ''"
                    class="flex items-center gap-3 p-3 rounded-md hover:bg-primaryLight hover:text-white mx-2 mb-2 transition-all duration-200 text-left"
                    :class="{
                      'bg-gradient-to-r from-primaryLight to-primaryDark text-white': route.path === child.path,
                      'justify-center': collapsed,
                    }"
                  >
                    <component :is="child.icon" class="w-5 h-5 shrink-0" />
                    <span v-if="!collapsed">{{ child.label }}</span>
                  </router-link>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>

      <!-- Footer -->
      <div class="border-t border-border p-3">
        <router-link
          to="/profile"
          class="flex items-center gap-3 p-3 rounded-md hover:bg-primaryLight hover:text-white mx-1 mb-2 transition-all duration-200 text-left"
          :class="{ 'justify-center': collapsed }"
        >
          <IdentificationIcon class="w-6 h-6 shrink-0" />
          <span v-if="!collapsed">Profile</span>
        </router-link>

        <button
          @click="logout"
          class="flex items-center gap-3 p-3 rounded-md hover:bg-danger hover:text-white mx-1 mb-2 w-full transition-all duration-200 text-left"
          :class="{ 'justify-center': collapsed }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25a.75.75 0 00-.75-.75H5.25A.75.75 0 004.5 5.25v13.5a.75.75 0 00.75.75h9.75a.75.75 0 00.75-.75V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span v-if="!collapsed">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="showMobileSidebar"
      class="fixed inset-0 bg-black/40 md:hidden z-40"
      @click="showMobileSidebar = false"
    ></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen md:min-h-0">
      <!-- Top Navbar -->
      <header class="bg-gradient-to-r from-primaryLight to-primaryDark text-white h-16 flex justify-between items-center px-4">
        <div class="flex items-center gap-3">
          <!-- Hamburger only visible on mobile -->
          <button class="md:hidden focus:outline-none" @click="showMobileSidebar = true">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5" />
            </svg>
          </button>
          <h1 class="text-lg sm:text-xl font-semibold text-surface">{{ pageTitle }}</h1>
        </div>

        <div class="flex items-center gap-4 px-2 sm:px-6">
          <span class="hidden sm:block text-gray-100">{{ currentUserName }}</span>
          <router-link to="/profile">
            <img :src="avatarUrl" alt="Profile" class="w-8 h-8 rounded-full ring-2 ring-white cursor-pointer hover:opacity-80 transition" />
          </router-link>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden md:overflow-y-auto md:max-h-[calc(100vh-4rem)]">
        <slot />
      </main>
    </div>

    <ConfirmDialog
      :open="confirmState.open"
      :title="confirmState.title"
      :message="confirmState.message"
      :confirm-label="confirmState.confirmLabel"
      :cancel-label="confirmState.cancelLabel"
      :variant="confirmState.variant"
      @confirm="resolveConfirmDialog"
      @cancel="cancelConfirmDialog"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
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
  ClockIcon,
  KeyIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/useAuthStore'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { provideConfirmDialog } from '@/stores/useConfirmDialog'

const collapsed = ref(false)
const showMobileSidebar = ref(false)
const openGroup = ref(null)
const route = useRoute()
const authStore = useAuthStore()
const {
  state: confirmState,
  confirm: resolveConfirmDialog,
  cancel: cancelConfirmDialog,
  open: openConfirmDialog,
} = provideConfirmDialog()

function toggleGroup(label) {
  openGroup.value = openGroup.value === label ? null : label
}

function toggleCollapse() {
  if (window.innerWidth >= 768) collapsed.value = !collapsed.value
  else showMobileSidebar.value = !showMobileSidebar.value
}

const baseMenu = [
  {
    label: 'Pengujian',
    icon: FolderIcon,
    children: [
      { label: 'Permintaan', path: '/permintaan', icon: ClipboardDocumentListIcon },
      { label: 'Kaji Ulang', path: '/kaji-ulang', icon: CheckCircleIcon },
    ],
  },
  {
    label: 'Layanan & Tarif',
    icon: Cog6ToothIcon,
    children: [{ label: 'Daftar Layanan', path: '/layanan', icon: Cog6ToothIcon }],
  },
  {
    label: 'Cetak',
    icon: BriefcaseIcon,
    children: [
      { label: 'Validasi', path: '/validasi', icon: CheckCircleIcon },
      { label: 'Kartu Kendali', path: '/kartu-kendali', icon: IdentificationIcon },
      { label: 'Surat Perintah', path: '/surat-perintah', icon: BriefcaseIcon },
    ],
  },
  {
    label: 'Laporan',
    icon: ChartBarIcon,
    children: [{ label: 'Keuangan', path: '/laporan-keuangan', icon: CreditCardIcon }],
  },
  {
    label: 'Monitoring',
    icon: ClockIcon,
    children: [{ label: 'Riwayat Aktivitas', path: '/riwayat', icon: ClockIcon }],
  },
  {
    label: 'Manajemen Pengguna',
    icon: UserGroupIcon,
    children: [
      { label: 'Pengguna', path: '/users', icon: UserGroupIcon },
      { label: 'Role', path: '/roles', icon: Cog6ToothIcon },
      { label: 'Permission', path: '/permissions', icon: Cog6ToothIcon },
      { label: 'Kode Undangan', path: '/kode-undangan', icon: KeyIcon },
    ],
  },
]

const groupedMenu = computed(() => baseMenu)

const pageTitle = computed(() => {
  const activeChild = groupedMenu.value
    .flatMap((g) => g.children)
    .find((i) => i.path === route.path)
  return activeChild ? activeChild.label : (route.path.replace('/', '') || 'Dashboard')
})

const currentUserName = computed(() => authStore.currentUser?.name || 'Guest')
const avatarUrl = computed(() => authStore.currentUser?.avatarUrl || '/img/avatar-default.png')

async function logout() {
  const ok = await openConfirmDialog({
    title: 'Keluar dari aplikasi?',
    message: 'Sesi Anda akan ditutup dan perlu login kembali.',
    confirmLabel: 'Logout',
    variant: 'danger',
  })
  if (!ok) return
  authStore.logout()
  window.location.href = '/login'
}
</script>

<style scoped>
aside::-webkit-scrollbar {
  display: none;
}

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
