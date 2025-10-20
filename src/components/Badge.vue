<template>
  <span
    class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
    :class="badgeClass"
  >
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

// 🗺️ Peta status → warna + label
const statusMap = {
  // ==== STATUS PERMINTAAN ====
  draft: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Draft' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dikirim' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Disetujui' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Ditolak' },

  // ==== STATUS ORDER / PENGUJIAN ====
  new: { bg: 'bg-sky-100', text: 'text-sky-700', label: 'Baru' },
  pending_validation: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Menunggu Validasi',
  },
  in_testing: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Dalam Uji' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Selesai' },
}

// 🎨 Fallback default
const badge = computed(() => {
  const found = statusMap[props.status]
  if (found) return found
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    label: props.status || '-',
  }
})

// 🧠 Kelas & teks final
const badgeClass = computed(() => `${badge.value.bg} ${badge.value.text}`)
const text = computed(() => badge.value.label)
</script>

<style scoped>
/* Sedikit animasi supaya badge terasa halus */
span {
  transition: all 0.2s ease;
}
</style>
