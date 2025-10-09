<<<<<<< HEAD
# Lab_Upt_Web
=======
# Panduan Pembuatan Aplikasi Dashboard UPT Laboratorium Perindustrian

Dokumen ini menjelaskan langkah‐langkah untuk menyiapkan proyek Vue 3 (Vite + TailwindCSS) beserta contoh kode yang sudah disiapkan. Aplikasi ini mensimulasikan dashboard laboratorium milik pemerintah (UPT Laboratorium Perindustrian – Kabupaten Tegal) dengan fitur pengelolaan order, permintaan pengujian, validasi, kartu kendali, surat perintah, serta master data.

## 1. Persiapan lingkungan

1. **Pastikan Node.js terpasang** – minimal versi 16. Anda dapat memeriksa dengan perintah:
   ```bash
   node --version
   ```
2. **Ekstrak proyek** dari arsip `upt-lab-dashboard.zip` yang disertakan. Struktur hasil ekstraksi adalah sebagai berikut:

   ```text
   upt-lab-dashboard/
   ├── index.html
   ├── package.json
   ├── postcss.config.js
   ├── tailwind.config.js
   ├── vite.config.js
   └── src/
       ├── App.vue
       ├── main.js
       ├── assets/styles.css
       ├── router/index.js
       ├── stores/
       ├── components/
       └── pages/
   ```

3. **Instal dependensi** – masuk ke direktori `upt-lab-dashboard` dan jalankan:
   ```bash
   cd upt-lab-dashboard
   npm install
   ```

   Dependensi utama meliputi:

   - `vue` dan `@vitejs/plugin-vue` – kerangka kerja frontend.
   - `vue-router` – untuk routing halaman.
   - `pinia` – state management.
   - `tailwindcss`, `postcss`, `autoprefixer` – styling.
   - `@heroicons/vue` – ikon.

4. **Menjalankan server pengembangan**:
   ```bash
   npm run dev
   ```
   Server Vite akan berjalan pada port 5173 secara default dan secara otomatis membuka browser. Semua perubahan di dalam folder `src/` akan memicu reload instan.

5. **Build untuk produksi**:
   ```bash
   npm run build
   ```
   Hasil build akan tersimpan di direktori `dist/`.

## 2. Struktur kode utama

### a. Entry point dan konfigurasi

- `index.html` – memuat font Poppins, memanggil `src/main.js` dan menyiapkan elemen `<div id="app"></div>`.
- `vite.config.js` – konfigurasi Vite dengan plugin Vue serta alias `@` yang menunjuk ke `src/`.
- `tailwind.config.js` & `postcss.config.js` – konfigurasi Tailwind beserta palet warna khusus (primary, success, warning, danger, dll.) serta font family Poppins/Roboto.
- `src/main.js` – inisialisasi aplikasi, memasang Pinia, Vue Router, dan mengimpor Tailwind global styles.

### b. State management (Pinia)

Enam store didefinisikan di folder `src/stores/`:

| Store              | Deskripsi singkat                                                                         |
|--------------------|-------------------------------------------------------------------------------------------|
| `useOrderStore`    | Menyimpan daftar order beserta metode untuk menambah, memperbarui status, menambahkan pembayaran, serta penugasan staf |
| `useCustomerStore` | Menyimpan data pelanggan contoh (nama & alamat)                                           |
| `useUserStore`     | Daftar pengguna dengan role seperti Admin Penerima, Manajer Teknis, Penyelia, Teknisi, Customer, dan Super Admin |
| `useTestStore`     | Master data jenis pengujian (nama, tarif, metode, peralatan)                             |
| `useActivityStore` | Mencatat log aktivitas (siapa melakukan apa pada order tertentu, beserta timestamp) untuk ditampilkan di dashboard |
| `useAuthStore`     | Menangani autentikasi sederhana; menyimpan `currentUser` dan menyediakan aksi `login()`/`logout()` |

Setiap store menggunakan Composition API `defineStore` dari Pinia untuk mendefinisikan state dan actions.  Semua nama field dan fungsi menggunakan bahasa Inggris demi konsistensi kode, sementara label UI tetap dapat berbahasa Indonesia.

### c. Layout dan komponen bersama

- **AppShell.vue** – kerangka utama yang terdiri dari sidebar navigasi dan top navbar. Sidebar dapat dikolaps, memuat tautan ke setiap halaman. Top navbar menampilkan judul halaman sesuai rute aktif.
- **StatCard.vue** – kartu kecil menampilkan angka KPI dengan ikon berwarna.
- **DataTable.vue** – tabel generik dengan fitur pencarian, sorting, dan paginasi. Header kolom dapat diklik untuk mengurutkan, dan slot digunakan untuk custom cell (misal badge status).
- **Badge.vue** – menampilkan status dengan warna berbeda.
- **FormRow.vue** – wrapper sederhana untuk label dan kontrol input.
- **CurrencyInput.vue** – input angka dengan format Rupiah (`Rp`) otomatis.
- **FileUpload.vue** – upload file dengan pratinjau dan kemampuan hapus.
- **SignaturePad.vue** – kanvas untuk menandatangani; dapat dibersihkan atau disimpan sebagai gambar Base64.
- **PrintArea.vue** – komponen pembungkus untuk area yang ingin dicetak menggunakan media query `@media print`.

### d. Halaman

| Halaman Route         | Konten utama |
|-----------------------|--------------|
| **Dashboard** (`/dashboard`) | Menampilkan statistik KPI (order baru, menunggu validasi, dalam uji, selesai), placeholder chart mingguan, filter & tabel daftar order dengan badge status serta log aktivitas terakhir |
| **Kaji Ulang** (`/kaji-ulang`) | Form header order, tabel evaluasi kaji ulang dengan opsi hasil (Ada/Tidak/OK/Tidak OK/Siap Uji/Prepare), kolom catatan, tanda tangan customer & admin, tombol Simpan/Tolak/Lolos Kaji Ulang | Info order, tabel permintaan pengujian dengan pilihan jenis pengujian, jumlah, subtotal; ringkasan biaya (total, pajak, grand total, uang muka, sisa bayar); upload bukti transfer; tanda tangan customer & penerima; tombol Simpan & Cetak slip/invoice
| **Validasi** (`/validasi`) | Form validasi manajer teknis: tabel penugasan untuk setiap uji (jenis uji, jumlah sampel, kode, metode, peralatan, waktu), pilih penyelia & teknisi, tanda tangan manajer teknis & penerima sampel, tombol kembalikan ke admin atau kirim ke penyelia |
| **Kartu Kendali** (`/kartu-kendali`) | Header order dan keterangan, timeline progress, tabel paraf grid (tahap, tanggal, jam, tanda tangan) untuk banyak peran (penerima sampel, manajer teknis, penyelia, teknisi, customer, dll.), tombol Simpan & Update Status |
| **Surat Perintah** (`/surat-perintah`) | Form penerbitan surat perintah: pilih teknisi, tabel detail pengujian serupa validasi, tanda tangan penyelia uji, tombol terbitkan yang mencetak surat resmi |
| **Master** (`/master`) | Halaman CRUD sederhana untuk jenis pengujian, peralatan, dan pengguna. Anda dapat menambah/hapus item langsung di tabel dan state akan disimpan di Pinia |
| **Keuangan** (`/keuangan`) | Tabel keuangan sederhana yang merangkum total order, uang muka, dan sisa pembayaran. Tersedia tombol export ke CSV |
| **Laporan** (`/laporan`) | Laporan lengkap dengan filter periode dan status. Data dapat diekspor ke CSV |
| **Users** (`/users`) | Manajemen pengguna (tambah, hapus, aktif/nonaktif) dengan kolom nama, role, dan status aktif |
| **Login** (`/login`) | Halaman login sederhana; pengguna memilih nama dan role. Setelah login, navigasi menyesuaikan role |

Navigasi diatur melalui `src/router/index.js` dengan penerapan **guard**: jika pengguna belum login maka otomatis dialihkan ke halaman login.  Sidebar menyesuaikan dengan role pengguna yang sedang masuk (Super Admin, Admin Penerima, Manajer Teknis, Penyelia, Teknisi, Customer), sebagaimana didefinisikan dalam `AppShell.vue`.

## 3. Catatan penggunaan

- Semua state mutasi hanya terjadi di Pinia; tidak ada backend API. Aplikasi ini merupakan skeleton yang siap diintegrasikan dengan API nyata.
- Komponen tanda tangan menggunakan `<canvas>` sederhana; output Base64 ditangkap melalui event `save`. Implementasi ini cukup untuk demo, tetapi Anda dapat mengganti dengan library seperti `signature_pad` untuk fitur lebih lengkap.
- Halaman cetak (slip/invoice & surat perintah) dibungkus dalam komponen `PrintArea`. Saat Anda mengklik tombol cetak, properti boolean diaktifkan dan `window.print()` dipanggil agar browser menampilkan dialog cetak.

## 4. Menjalankan aplikasi dari nol

Jika Anda ingin membuat proyek serupa secara manual, berikut langkah‐langkah ringkasnya:

1. **Inisialisasi proyek baru**:
   ```bash
   npm create vite@latest upt-lab-dashboard -- --template vue
   cd upt-lab-dashboard
   ```
2. **Pasang dependensi tambahan**:
   ```bash
   npm install vue-router pinia @heroicons/vue
   npm install -D tailwindcss postcss autoprefixer @vitejs/plugin-vue
   npx tailwindcss init -p
   ```
3. **Konfigurasi Tailwind & Vite** sesuai warna dan font yang dibutuhkan.
4. **Buat store** menggunakan Pinia di folder `src/stores`.
5. **Buat komponen layout dan utilitas** (navbar, sidebar, tabel, badge, input, signature, dll.) di folder `src/components`.
6. **Definisikan rute** di `src/router/index.js` dan buat file halaman di `src/pages` yang memanfaatkan store & komponen.
7. **Jalankan server dev** dengan `npm run dev` dan mulai membangun fitur tambahan sesuai kebutuhan.

Dengan mengikuti panduan dan contoh kode ini Anda dapat mengembangkan dashboard laboratorium yang profesional menggunakan Vue 3, Vite, TailwindCSS, dan Pinia.
>>>>>>> 06fd7ea (First Commit)
