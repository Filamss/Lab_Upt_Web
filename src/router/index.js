import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/useAuthStore';

// Lazy-load pages
const DashboardPage = () => import('../pages/DashboardPage.vue');
const PermintaanPage = () => import('../pages/PermintaanPage.vue');
const KajiUlangPage = () => import('../pages/KajiUlangPage.vue');
const ValidasiPage = () => import('../pages/ValidasiPage.vue');
const KartuKendaliPage = () => import('../pages/KartuKendaliPage.vue');
const SuratPerintahPage = () => import('../pages/SuratPerintahPage.vue');
const LayananPage = () => import('../pages/LayananPage.vue');
const LoginPage = () => import('../pages/LoginPage.vue');
const KeuanganPage = () => import('../pages/KeuanganPage.vue');
const LaporanPage = () => import('../pages/LaporanPage.vue');
const UsersPage = () => import('../pages/UsersPage.vue');
const RolesPage = () => import('../pages/RolesPage.vue');
const PermissionsPage = () => import('../pages/PermissionsPage.vue');
const KajiUlangPrint = () => import('../components/print/KajiUlangPrint.vue');
const PrintPage = () => import('../components/print/PrintPage.vue');
const ProfilePage = () => import('../pages/ProfilePage.vue');
const RiwayatPage = () => import('../pages/RiwayatPage.vue');
const KodeUndanganPage = () => import('../pages/KodeUndanganPage.vue');

const routes = [
  { path: '/', redirect: '/dashboard' },

  { path: '/login', component: LoginPage, meta: { layout: 'auth', authMode: 'login' } },
  { path: '/register', component: LoginPage, meta: { layout: 'auth', authMode: 'register' } },
  { path: '/dashboard', component: DashboardPage },
  { path: '/profile', component: ProfilePage },
  { path: '/permintaan', component: PermintaanPage },
  { path: '/kaji-ulang', component: KajiUlangPage },
  { path: '/validasi', component: ValidasiPage },
  { path: '/kartu-kendali', component: KartuKendaliPage },
  { path: '/surat-perintah', component: SuratPerintahPage },
  { path: '/layanan', component: LayananPage },
  { path: '/laporan-keuangan', component: KeuanganPage },
  { path: '/laporan', component: LaporanPage },
  { path: '/riwayat', component: RiwayatPage },
  { path: '/users', component: UsersPage },
  { path: '/roles', component: RolesPage },
  { path: '/permissions', component: PermissionsPage },
  { path: '/kode-undangan', component: KodeUndanganPage },

  {
    path: '/kaji-ulang/print',
    component: KajiUlangPrint,
    meta: { layout: 'print' },
  },
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
