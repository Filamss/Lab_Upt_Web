import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';

// Lazy-load pages
const DashboardPage = () => import('../pages/DashboardPage.vue');
const KajiUlangPage = () => import('../pages/KajiUlangPage.vue');
const ValidasiPage = () => import('../pages/ValidasiPage.vue');
const KartuKendaliPage = () => import('../pages/KartuKendaliPage.vue');
const SuratPerintahPage = () => import('../pages/SuratPerintahPage.vue');
const LayananPage = () => import('../pages/LayananPage.vue');
const LoginPage = () => import('../pages/LoginPage.vue');
const KeuanganPage = () => import('../pages/KeuanganPage.vue');
const LaporanPage = () => import('../pages/LaporanPage.vue');
const UsersPage = () => import('../pages/UsersPage.vue');
const KajiUlangPrint = () => import('../pages/print/KajiUlangPrint.vue');
const PrintPage = () => import('../pages/print/PrintPage.vue');
const ProfilePage = () => import('../pages/ProfilePage.vue')
const routes = [
  { path: '/', redirect: '/dashboard' },

  // 👇 halaman login tanpa layout (fullscreen)
  { path: '/login', component: LoginPage, meta: { layout: 'auth' } },
  { path: '/dashboard', component: DashboardPage },
  { path: '/profile', component: ProfilePage },
  { path: '/kaji-ulang', component: KajiUlangPage },
  { path: '/validasi', component: ValidasiPage },
  { path: '/kartu-kendali', component: KartuKendaliPage },
  { path: '/surat-perintah', component: SuratPerintahPage },
  { path: '/layanan', component: LayananPage },
  { path: '/keuangan', component: KeuanganPage },
  { path: '/laporan', component: LaporanPage },
  { path: '/users', component: UsersPage },

  // 👇 halaman print juga tanpa layout
  {
    path: '/kaji-ulang/print',
    component: KajiUlangPrint,
    meta: { layout: 'print' },
  },
  // Generic print route: /print/:type/:id?
  {
    path: '/print/:type/:id?',
    component: PrintPage,
    meta: { layout: 'print' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// === NAVIGATION GUARD ===
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Izinkan halaman login & print tanpa autentikasi
  if (to.meta.layout === 'auth' || to.meta.layout === 'print') {
    return next();
  }

  // Jika belum login, arahkan ke /login
  if (!authStore.currentUser) {
    return next('/login');
  }

  next();
});

export default router;
