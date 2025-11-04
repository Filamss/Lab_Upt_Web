<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <header class="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-teal-500 text-white">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute -left-16 top-10 h-64 w-64 rounded-full bg-white/40 blur-3xl"></div>
        <div class="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-white/30 blur-3xl"></div>
      </div>
      <div class="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-20 lg:flex-row lg:items-center">
        <div class="flex-1 space-y-6" data-reveal data-reveal-delay="100">
          <p class="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-sm font-medium uppercase tracking-widest">
            UPT Laboratorium Kab. Tegal
          </p>
          <h1 class="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            Sistem Informasi Terpadu untuk Pengelolaan Layanan Laboratorium
          </h1>
          <p class="max-w-2xl text-lg text-slate-100/90">
            Aplikasi dashboard UPT Laboratorium Kabupaten Tegal membantu mengelola permintaan layanan,
            kaji ulang, validasi, hingga pelaporan keuangan dalam satu platform yang terintegrasi.
          </p>
          <div class="flex flex-wrap gap-4">
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-sky-600 shadow transition hover:bg-slate-100"
            >
              Masuk ke Dashboard
            </RouterLink>
            <a
              href="#informasi"
              @click.prevent="scrollToSection('informasi')"
              class="inline-flex items-center justify-center rounded-lg bg-white/15 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/25"
            >
              Pelajari Lebih Lanjut
            </a>
            <a
              href="#cek-order"
              @click.prevent="scrollToSection('cek-order')"
              class="inline-flex items-center justify-center rounded-lg bg-white/15 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/25"
            >
              Cek Status Order
            </a>
          </div>
        </div>
        <div class="flex-1" data-reveal data-reveal-delay="200">
          <div class="relative mx-auto max-w-lg rounded-3xl bg-white/10 p-6 shadow-xl backdrop-blur">
            <div class="grid grid-cols-2 gap-4 text-sm text-slate-900">
              <div class="rounded-2xl bg-white/90 p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase text-sky-500">Monitoring</p>
                <p class="mt-2 text-lg font-semibold">Status Permintaan</p>
                <p class="mt-1 text-xs text-slate-500">Pantau progres permintaan layanan secara real-time.</p>
              </div>
              <div class="rounded-2xl bg-white/90 p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase text-sky-500">Kolaborasi</p>
                <p class="mt-2 text-lg font-semibold">Kaji Ulang Terpadu</p>
                <p class="mt-1 text-xs text-slate-500">Koordinasi antar petugas dalam proses kaji ulang.</p>
              </div>
              <div class="rounded-2xl bg-white/90 p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase text-sky-500">Dokumentasi</p>
                <p class="mt-2 text-lg font-semibold">Arsip Digital</p>
                <p class="mt-1 text-xs text-slate-500">Cetak surat perintah dan kartu kendali instan.</p>
              </div>
              <div class="rounded-2xl bg-white/90 p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase text-sky-500">Pelaporan</p>
                <p class="mt-2 text-lg font-semibold">Analitik Keuangan</p>
                <p class="mt-1 text-xs text-slate-500">Susun dan unduh laporan keuangan secara cepat.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-24 px-6 py-20">
      <section
        id="cek-order"
        class="-mt-16 rounded-3xl border border-white/40 bg-white/95 p-6 shadow-2xl ring-1 ring-slate-100 backdrop-blur lg:-mt-20 lg:p-10"
        data-reveal
        data-reveal-delay="150"
      >
        <div class="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div class="space-y-4" data-reveal data-reveal-delay="200">
            <p class="text-sm font-semibold uppercase tracking-wide text-sky-600">Cek Status Permintaan</p>
            <h2 class="text-3xl font-semibold text-slate-900">Lihat progres order secara mandiri</h2>
            <p class="text-base text-slate-600">
              Masukkan ID order Anda untuk mengetahui posisi permintaan di UPT Laboratorium Kabupaten Tegal.
              Fitur ini mirip pelacakan status di aplikasi e-commerce sehingga memudahkan pemohon memantau progres.
            </p>

            <form
              @submit.prevent="handleCheckOrder"
              class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow"
              data-reveal
              data-reveal-delay="260"
            >
              <label class="text-sm font-medium text-slate-700" for="order-id-input">
                ID Order
              </label>
              <div class="flex flex-col gap-3 sm:flex-row">
                <input
                  id="order-id-input"
                  v-model="searchId"
                  type="text"
                  autocomplete="off"
                  placeholder="Contoh: ORD-202501-001"
                  class="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                />
                <button
                  type="submit"
                  class="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                  :disabled="isChecking"
                >
                  <span v-if="!isChecking">Cek Status</span>
                  <span v-else class="flex items-center gap-2">
                    <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Memeriksa...
                  </span>
                </button>
              </div>
              <p v-if="checkError" class="text-sm text-rose-600">{{ checkError }}</p>
              <p v-else-if="hasSearched && !checkResult && !isChecking" class="text-sm text-slate-500">
                Tidak menemukan data untuk ID Order tersebut. Periksa kembali penulisan ID atau hubungi petugas layanan.
              </p>
            </form>
          </div>

          <div
            class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 text-slate-800 shadow-lg"
            data-reveal
            data-reveal-delay="320"
          >
            <div class="absolute inset-0 opacity-30">
              <div class="absolute -top-20 right-10 h-52 w-52 rounded-full bg-sky-400/20 blur-3xl"></div>
              <div class="absolute -bottom-20 left-0 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl"></div>
            </div>
            <div class="relative space-y-4">
              <p class="text-sm font-semibold uppercase tracking-[0.35em] text-sky-600">UPT LAB</p>
              <h3 class="text-2xl font-semibold text-slate-900">Transparansi Status Permintaan</h3>
              <p class="text-sm text-slate-600">
                Setiap permintaan yang masuk tercatat secara digital. Anda bisa memantau riwayat pembayaran,
                verifikasi, hingga tindak lanjut tanpa harus menunggu konfirmasi manual.
              </p>
              <ul class="space-y-3 text-sm text-slate-600">
                <li class="flex items-center gap-3">
                  <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                    1
                  </span>
                  Proses permintaan terdokumentasi dari awal hingga akhir.
                </li>
                <li class="flex items-center gap-3">
                  <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                    2
                  </span>
                  Status pembayaran tampil otomatis begitu diverifikasi.
                </li>
                <li class="flex items-center gap-3">
                  <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                    3
                  </span>
                  Pengingat apabila ada kekurangan dokumen atau revisi kaji ulang.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <transition name="fade">
          <div
            v-if="checkResult"
            class="mt-10 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg lg:mt-12 lg:p-8"
            data-reveal
            data-reveal-delay="380"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div data-reveal data-reveal-delay="420">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">ID Order</p>
                <p class="mt-1 text-2xl font-semibold text-slate-900">{{ checkResult.idOrder }}</p>
                <p class="mt-2 text-sm text-slate-600">
                  Status diperbarui terakhir: {{ formatDate(checkResult.updatedAt || checkResult.createdAt || checkResult.entryDate) }}
                </p>
              </div>
              <span
                :class="['inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold', statusBadgeClass]"
                data-reveal
                data-reveal-delay="460"
              >
                {{ statusLabel }}
              </span>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div class="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-reveal data-reveal-delay="500">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Pemohon</p>
                <p class="text-sm font-semibold text-slate-900">{{ checkResult.customerName || '-' }}</p>
                <p class="text-xs text-slate-500">{{ checkResult.phoneNumber || checkResult.email || 'Kontak tidak tersedia' }}</p>
              </div>
              <div class="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-reveal data-reveal-delay="540">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Tanggal Permintaan</p>
                <p class="text-sm font-semibold text-slate-900">
                  {{ formatDate(checkResult.entryDate || checkResult.createdAt) }}
                </p>
                <p class="text-xs text-slate-500">Jam layanan: Senin - Jumat 08.00 - 15.30 WIB</p>
              </div>
              <div class="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4" data-reveal data-reveal-delay="580">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Paket / Tujuan</p>
                <p class="text-sm font-semibold text-slate-900">
                  {{ checkResult.workPackage || checkResult.purpose || 'Belum ditentukan' }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ (checkResult.jobCategory && `Kategori: ${checkResult.jobCategory}`) || 'Kategori belum tercatat' }}
                </p>
              </div>
            </div>

            <div>
              <p class="text-sm font-semibold text-slate-900">Progress Order</p>
              <ol class="mt-4 space-y-4">
                <li
                  v-for="(step, index) in progressSteps"
                  :key="step.key"
                  class="flex gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm"
                  data-reveal
                  :data-reveal-delay="600 + index * 60"
                >
                  <span
                    :class="[
                      'mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                      stepStateBubble[step.state]
                    ]"
                  >
                    {{ stepIndexLabel(step.key) }}
                  </span>
                  <div>
                    <p class="font-semibold text-slate-900" :class="step.state === 'failed' ? 'text-rose-600' : ''">
                      {{ step.label }}
                    </p>
                    <p class="text-sm text-slate-600">{{ step.description }}</p>
                  </div>
                </li>
              </ol>
            </div>

            <div
              v-if="specialStatus"
              class="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700"
              data-reveal
              data-reveal-delay="620"
            >
              <p class="font-semibold text-amber-800">{{ specialStatus.title }}</p>
              <p class="mt-1 leading-relaxed">{{ specialStatus.message }}</p>
            </div>

            <div
              v-if="checkResult.paymentInfo"
              class="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              data-reveal
              data-reveal-delay="640"
            >
              <p class="text-sm font-semibold text-slate-900">Ringkasan Pembayaran</p>
              <div class="mt-3 grid gap-4 sm:grid-cols-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Tagihan</p>
                  <p class="text-sm font-semibold text-slate-900">
                    {{ formatCurrency(checkResult.paymentInfo.total) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Sudah Dibayar</p>
                  <p class="text-sm font-semibold text-slate-900">
                    {{ formatCurrency(checkResult.paymentInfo.amountPaid) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Sisa Tagihan</p>
                  <p
                    class="text-sm font-semibold"
                    :class="checkResult.paymentInfo.outstanding > 0 ? 'text-rose-600' : 'text-emerald-700'"
                  >
                    {{ formatCurrency(checkResult.paymentInfo.outstanding) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </section>

      <section id="informasi" class="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]" data-reveal data-reveal-delay="200">
        <div class="space-y-6" data-reveal data-reveal-delay="240">
          <h2 class="text-3xl font-semibold text-slate-900">Tentang UPT Laboratorium Kabupaten Tegal</h2>
          <p class="text-base text-slate-600">
            UPT Laboratorium Kabupaten Tegal memberikan layanan pengujian kualitas lingkungan, kesehatan, dan
            produk lokal untuk mendukung pembangunan daerah. Kami berkomitmen pada kualitas layanan, integritas,
            dan hasil pengujian yang akurat.
          </p>
          <p class="text-base text-slate-600">
            Melalui dashboard ini, setiap permintaan layanan tercatat dengan baik mulai dari penerimaan,
            penjadwalan, kaji ulang, hingga validasi dan pelaporan. Pengguna internal dapat berkolaborasi secara
            efisien, meminimalisir proses manual, dan meningkatkan akuntabilitas.
          </p>
          <ul class="grid gap-4 sm:grid-cols-2">
            <li class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-reveal data-reveal-delay="280">
              <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                1
              </span>
              <div>
                <p class="font-semibold text-slate-900">Layanan Terstandar</p>
                <p class="text-sm text-slate-600">Memenuhi standar mutu laboratorium daerah.</p>
              </div>
            </li>
            <li class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-reveal data-reveal-delay="320">
              <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                2
              </span>
              <div>
                <p class="font-semibold text-slate-900">Transparan & Cepat</p>
                <p class="text-sm text-slate-600">Status pelayanan dapat dipantau kapan pun.</p>
              </div>
            </li>
            <li class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-reveal data-reveal-delay="360">
              <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                3
              </span>
              <div>
                <p class="font-semibold text-slate-900">Kolaboratif</p>
                <p class="text-sm text-slate-600">Memudahkan koordinasi antar tim teknis dan administrasi.</p>
              </div>
            </li>
            <li class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm" data-reveal data-reveal-delay="400">
              <span class="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                4
              </span>
              <div>
                <p class="font-semibold text-slate-900">Terintegrasi</p>
                <p class="text-sm text-slate-600">Data permintaan, kaji ulang, dan laporan terhubung otomatis.</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg" data-reveal data-reveal-delay="320">
          <h3 class="text-xl font-semibold text-slate-900">Fitur Utama Dashboard</h3>
          <ul class="mt-6 space-y-4 text-sm text-slate-600">
            <li class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
              Pengelolaan permintaan layanan laboratorium dari berbagai instansi.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
              Proses kaji ulang terstruktur dengan riwayat dan catatan pendukung.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
              Penerbitan surat perintah, kartu kendali, dan dokumen pendukung secara digital.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
              Laporan keuangan dan operasional yang mudah diakses kapan pun.
            </li>
            <li class="flex items-start gap-3">
              <span class="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500"></span>
              Manajemen pengguna, peran, serta hak akses yang fleksibel.
            </li>
          </ul>

          <div class="mt-10 rounded-2xl bg-slate-50 p-5">
            <p class="text-sm font-semibold text-slate-900">Jam Layanan</p>
            <p class="text-sm text-slate-600">Senin - Jumat, 08.00 - 15.30 WIB</p>

            <p class="mt-6 text-sm font-semibold text-slate-900">Kontak</p>
            <p class="text-sm text-slate-600">Jl. Dr. Soetomo No. 5, Slawi, Kabupaten Tegal</p>
            <p class="text-sm text-slate-600">Email: uptlab@tegalkab.go.id</p>
            <p class="text-sm text-slate-600">Telp: (0283) 123456</p>
          </div>
        </div>
      </section>

      <section class="rounded-3xl bg-white px-8 py-10 shadow-lg" data-reveal data-reveal-delay="200">
        <div class="grid items-center gap-6 md:grid-cols-[1.5fr,1fr]">
          <div data-reveal data-reveal-delay="240">
            <h3 class="text-2xl font-semibold text-slate-900">Siap meningkatkan layanan laboratorium?</h3>
            <p class="mt-2 text-sm text-slate-600">
              Tim kami siap membantu Anda memanfaatkan dashboard ini untuk efisiensi operasional dan
              transparansi layanan di UPT Laboratorium Kabupaten Tegal.
            </p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:justify-end" data-reveal data-reveal-delay="320">
            <RouterLink
              to="/register"
              class="inline-flex items-center justify-center rounded-lg border border-sky-500 px-5 py-3 text-sm font-semibold text-sky-600 transition hover:bg-sky-50"
            >
              Daftar Akun
            </RouterLink>
            <RouterLink
              to="/login"
              class="inline-flex items-center justify-center rounded-lg bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Masuk Sekarang
            </RouterLink>
          </div>
        </div>
      </section>
    </main>

    <footer class="bg-slate-900 py-10 text-slate-300">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {{ currentYear }} UPT Laboratorium Kabupaten Tegal.</p>
        <p>Didukung oleh Sistem Informasi Dashboard Laboratorium.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { usePermintaanStore, requestStatusLabels } from '@/stores/usePermintaanStore'

const currentYear = new Date().getFullYear()

const permintaanStore = usePermintaanStore()
const searchId = ref('')
const isChecking = ref(false)
const checkResult = ref(null)
const checkError = ref('')
const hasSearched = ref(false)
const revealObserver = ref(null)

const stepStateBubble = {
  done: 'bg-emerald-500',
  current: 'bg-sky-500',
  pending: 'bg-slate-300',
  failed: 'bg-rose-500',
}

const baseSteps = [
  {
    key: 'draft',
    label: 'Permintaan Diterima',
    description: 'Permintaan berhasil dicatat di sistem dan menunggu proses berikutnya.',
  },
  {
    key: 'pending_payment',
    label: 'Menunggu Pembayaran',
    description: 'Silakan selesaikan pembayaran sesuai instruksi yang diberikan petugas.',
  },
  {
    key: 'payment_pending_review',
    label: 'Verifikasi Pembayaran',
    description: 'Tim kami sedang memeriksa bukti pembayaran yang diajukan.',
  },
  {
    key: 'payment_verified',
    label: 'Pembayaran Terverifikasi',
    description: 'Pembayaran sudah diterima dan diverifikasi oleh petugas keuangan.',
  },
  {
    key: 'approved',
    label: 'Permintaan Diproses',
    description: 'Permintaan Anda diteruskan ke tim teknis untuk diproses lebih lanjut.',
  },
]

const terminalStatuses = ['payment_review_rejected', 'rejected', 'cancelled']
const statusToStepKey = {
  payment_review_rejected: 'payment_pending_review',
  rejected: 'approved',
  cancelled: 'pending_payment',
}

const specialStatusMap = {
  payment_review_rejected: {
    title: 'Bukti Pembayaran Perlu Diperbaiki',
    message:
      'Bukti pembayaran yang Anda unggah belum dapat kami verifikasi. Silakan unggah ulang bukti pembayaran atau hubungi petugas keuangan untuk konfirmasi lebih lanjut.',
  },
  rejected: {
    title: 'Permintaan Ditolak',
    message:
      'Permintaan Anda tidak dapat kami proses. Mohon hubungi petugas layanan untuk mengetahui alasan penolakan dan langkah selanjutnya.',
  },
  cancelled: {
    title: 'Permintaan Dibatalkan',
    message:
      'Permintaan dibatalkan oleh pemohon atau petugas. Jika ingin melanjutkan, silakan ajukan permintaan baru melalui dashboard.',
  },
}

const formatStatus = (status = '') => {
  if (!status) return '-'
  if (requestStatusLabels[status]) return requestStatusLabels[status]
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return '-'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

const statusLabel = computed(() => formatStatus(checkResult.value?.status))

const statusBadgeClass = computed(() => {
  const status = checkResult.value?.status
  if (!status) {
    return 'bg-slate-200 text-slate-700'
  }
  if (['approved', 'payment_verified'].includes(status)) {
    return 'bg-emerald-100 text-emerald-700'
  }
  if (status === 'pending_payment') {
    return 'bg-amber-100 text-amber-700'
  }
  if (status === 'payment_pending_review') {
    return 'bg-sky-100 text-sky-700'
  }
  if (terminalStatuses.includes(status)) {
    return 'bg-rose-100 text-rose-600'
  }
  return 'bg-slate-200 text-slate-700'
})

const progressSteps = computed(() => {
  if (!checkResult.value) return []
  const status = checkResult.value.status || 'draft'
  const fallbackKey = statusToStepKey[status]
  let activeIndex = baseSteps.findIndex((step) => step.key === (fallbackKey || status))
  if (activeIndex === -1) {
    activeIndex = baseSteps.length - 1
  }
  const isTerminal = terminalStatuses.includes(status)
  return baseSteps.map((step, index) => {
    const state =
      index < activeIndex ? 'done' : index === activeIndex ? (isTerminal ? 'failed' : 'current') : 'pending'
    return {
      ...step,
      state,
    }
  })
})

const specialStatus = computed(() => {
  if (!checkResult.value?.status) return null
  return specialStatusMap[checkResult.value.status] || null
})

const stepIndexLabel = (key) => {
  const index = baseSteps.findIndex((step) => step.key === key)
  return index === -1 ? '•' : index + 1
}

const handleCheckOrder = async () => {
  const query = searchId.value.trim()
  hasSearched.value = true
  checkError.value = ''
  checkResult.value = null

  if (!query) {
    checkError.value = 'Masukkan ID Order terlebih dahulu.'
    return
  }

  isChecking.value = true
  try {
    const { ok, data, error } = await permintaanStore.checkOrderStatus(query)
    if (ok && data) {
      checkResult.value = data
    } else {
      checkError.value = error || 'Tidak menemukan data untuk ID Order tersebut.'
    }
  } catch (err) {
    console.error('Gagal memeriksa order:', err)
    checkError.value = 'Terjadi kesalahan saat memeriksa status. Silakan coba lagi.'
  } finally {
    isChecking.value = false
  }
}

const scrollToSection = (targetId) => {
  if (typeof window === 'undefined') return
  const section = document.getElementById(targetId)
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const initRevealAnimations = () => {
  if (typeof window === 'undefined') return
  if (revealObserver.value) {
    revealObserver.value.disconnect()
    revealObserver.value = null
  }
  const elements = Array.from(document.querySelectorAll('[data-reveal]'))
  if (!elements.length) return

  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach((el) => {
      el.classList.add('is-visible')
    })
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target
          el.classList.add('is-visible')
          observer.unobserve(el)
        }
      })
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px',
    }
  )

  elements.forEach((el, index) => {
    const delayAttr = el.dataset.revealDelay
    const delay = delayAttr !== undefined ? Number(delayAttr) : index * 70
    if (!Number.isNaN(delay)) {
      el.style.setProperty('--reveal-delay', `${delay}ms`)
    }
    observer.observe(el)
  })

  revealObserver.value = observer
}

onMounted(async () => {
  await nextTick()
  initRevealAnimations()
})

onBeforeUnmount(() => {
  if (revealObserver.value) {
    revealObserver.value.disconnect()
    revealObserver.value = null
  }
})

watch(
  () => checkResult.value,
  async () => {
    await nextTick()
    initRevealAnimations()
  }
)
</script>

<style scoped>
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}
</style>
