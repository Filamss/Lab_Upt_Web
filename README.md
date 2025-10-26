# UPT Lab Dashboard

Dashboard berbasis Vue 3/Vite/Tailwind untuk mengelola operasional UPT Laboratorium Perindustrian Kabupaten Tegal. Aplikasi ini memusatkan permintaan pengujian, kaji ulang, validasi, surat perintah, master data layanan, serta manajemen pengguna dalam satu antarmuka responsif.

## ✨ Fitur Utama

- **Permintaan Pengujian** – tambah/edit permintaan, pilih jenis uji, generate ringkasan biaya, lanjutkan ke pembayaran.
- **Kaji Ulang & Validasi** – evaluasi kelayakan sampel, tetapkan penanggung jawab, unggah tanda tangan digital.
- **Surat Perintah & Kartu Kendali** – pantau progres pekerjaan serta arsipkan log setiap tahapan.
- **Manajemen Master Data** – kelola layanan, mesin uji, metode, pengguna, role, permission.
- **Riwayat Aktivitas** – logging otomatis (login, permintaan, pembayaran) dengan halaman monitoring khusus.
- **Reusable Confirm Dialog** – setiap aksi penting (simpan, hapus, logout) menggunakan modal konfirmasi seragam.
- **UI Modern** – layout AppShell dengan sidebar collapsible, tabel responsif, badge status, dan komponen form modular.

## 🧱 Teknologi

| Layer     | Stack                                                                 |
| --------- | --------------------------------------------------------------------- |
| Framework | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)             |
| Styling   | [Tailwind CSS](https://tailwindcss.com/), custom utilities, Heroicons |
| State     | [Pinia](https://pinia.vuejs.org/)                                     |
| Routing   | [Vue Router 4](https://router.vuejs.org/)                             |
| Utilities | Custom composables (`useConfirmDialog`, dsb)                          |

## 🚀 Menjalankan Proyek

```bash
# 1. Pastikan Node.js >= 16
node --version

# 2. Instal dependensi
npm install

# 3. Jalankan server dev (http://localhost:5173)
npm run dev

# 4. Build produksi
npm run build

# 5. Preview hasil build
npm run preview
```

## 📂 Struktur Direktori Penting

```
src/
├── components/
│   ├── AppShell.vue          # Layout utama + provider confirm dialog
│   ├── DataTable.vue, Badge.vue, FileUpload.vue, SignaturePad.vue, dll.
│   └── form/                 # FormUser, FormRole, FormPermission, FormPermintaan, FormPayment, ...
├── pages/                    # Dashboard, Permintaan, Users, Roles, Permissions, dsb.
├── stores/                   # useAuthStore, useUserStore, useRoleStore, usePermintaanStore, useConfirmDialog, ...
├── router/index.js           # Definisi route + guard login
└── assets/styles.css         # Tailwind base & custom utilities
```

## 🧠 State Management (Pinia)

- `useAuthStore` – login/logout, token & currentUser.
- `useUserStore`, `useRoleStore`, `usePermissionStore` – CRUD master pengguna & akses.
- `usePermintaanStore` – normalisasi permintaan, integrasi API (kapan tersedia), dummy fallback.
- `useActivityStore` – menyimpan log aktivitas ke `localStorage`.
- `useConfirmDialog` – provider/injector dialog konfirmasi global.

Semua store memakai Composition API `defineStore`, sehingga mudah diuji maupun diintegrasikan dengan backend nyata.

## ✅ Confirm Dialog (Reusable Validation)

1. **Provider** sudah dipasang di `AppShell.vue`:

   ```js
   const { state, confirm, cancel, open } = provideConfirmDialog();
   ```

   dan `ConfirmDialog.vue` dirender sekali di bawah layout.

2. **Consumer** (form/page) cukup memanggil:

   ```js
   import { useConfirmDialog } from '@/stores/useConfirmDialog';
   const confirmDialog = useConfirmDialog();

   const ok = await confirmDialog({
     title: 'Hapus data?',
     message: 'Tindakan ini tidak dapat dibatalkan.',
     variant: 'danger',
     confirmLabel: 'Hapus',
   });
   if (!ok) return;
   // lanjutkan aksi
   ```

3. Implementasi saat ini mencakup:
   - Semua form simpan (User, Role, Permission, Permintaan, Payment).
   - Semua aksi hapus (Permintaan tunggal/bulk, User, Role, Permission, Kaji Ulang, Riwayat).
   - Logout pada AppShell.

Silakan gunakan hook yang sama untuk validasi tambahan (mis. reset form, ubah status, dsb).

## 🧩 Komponen Kunci

- **DataTable.vue** – dukung pencarian, sorting, stack-mode mobile, slot untuk kolom khusus.
- **ConfirmDialog.vue** – modal konfirmasi responsif dengan variasi primary/danger.
- **Form components** – composable-friendly, menerima `isEdit`, `loading`, `modelValue`.
- **FileUpload** – siap pakai untuk workflow dokumen.

## 🔧 Praktik Kode

- Gunakan alias `@` untuk impor dari `src/`.
- Simpan semua side effect di Pinia store; komponen bersifat presentational + event emit.
- Manfaatkan utility Tailwind (warna primer sudah diset di `tailwind.config.js`).
- Jalankan format/lint (ESLint/Prettier) sebelum commit jika tooling tersedia.

## 🧪 Testing Manual

1. CRUD pengguna/role/permission → pastikan dialog konfirmasi muncul.
2. Tambah permintaan + lanjutkan ke pembayaran → cek validasi dialog.
3. Hapus permintaan (tunggal & multi-select) → dialog danger.
4. Logout → dialog konfirmasi.
5. Clear riwayat aktivitas → dialog danger.

## 📝 Catatan

- Saat ini data dummy masih digunakan pada beberapa store; ketika API backend siap, ganti `try/catch` di store agar mengambil data nyata.
- Riwayat aktivitas persisten di `localStorage` (`uptlab.activityHistory`).
- Pastikan `public/img/avatar-default.png` tersedia untuk avatar default.

## 🤝 Kontribusi

1. Fork & clone repo ini.
2. Buat branch fitur: `git checkout -b feat/nama-fitur`.
3. Lakukan perubahan, tambahkan uji manual bila relevan.
4. Push dan buka pull request berisi ringkasan perubahan + screenshot jika UI berubah.

## 📬 Lisensi

Hak cipta tetap milik UPT Laboratorium Perindustrian Kabupaten Tegal. Gunakan contoh ini sebagai referensi internal atau proyek belajar sesuai kebutuhan Anda.
