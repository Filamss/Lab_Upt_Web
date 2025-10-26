<template>
  <span class="badge" :class="badgeClass">
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
})

const statusMap = {
  draft: {
    bg: 'bg-gray-200',
    text: 'text-gray-700',
    border: 'border border-gray-300',
    label: 'Draft',
  },
  approved: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border border-green-200',
    label: 'Disetujui',
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border border-red-200',
    label: 'Ditolak',
  },
  new: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border border-sky-200',
    label: 'Baru',
  },
  pending_validation: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border border-yellow-200',
    label: 'Menunggu Validasi',
  },
  pending_payment: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border border-amber-200',
    label: 'Menunggu Pembayaran',
  },
  payment_received: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border border-emerald-200',
    label: 'Pembayaran Berhasil',
  },
  in_testing: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border border-indigo-200',
    label: 'Dalam Uji',
  },
  completed: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border border-emerald-200',
    label: 'Selesai',
  },
}

const badge = computed(() => {
  const found = statusMap[props.status]
  if (found) return found
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    border: 'border border-gray-200',
    label: props.status || '-',
  }
})

const badgeClass = computed(
  () => `${badge.value.bg} ${badge.value.text} ${badge.value.border}`
)
const text = computed(() => badge.value.label)
</script>

<style scoped>
.badge {
  @apply w-full px-2.5 py-0.5 text-[10px] font-semibold rounded-md whitespace-normal break-words leading-tight inline-flex items-center justify-center text-center;
  transition: all 0.2s ease;
}

@media (min-width: 640px) {
  .badge {
    @apply w-auto max-w-full;
  }
}
</style>
