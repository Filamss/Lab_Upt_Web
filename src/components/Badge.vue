<template>
  <span
    class="px-2 py-1 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    {{ text }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
});

// Map order statuses to Tailwind colour classes and Indonesian labels.
// The keys here use English to match the store while the labels
// remain Indonesian for display.  Feel free to adjust colours to
// suit your design.
const statusMap = {
  new: { bg: 'bg-info/10', text: 'text-info', label: 'Baru' },
  pending_validation: { bg: 'bg-warning/10', text: 'text-warning', label: 'Menunggu Validasi' },
  in_testing: { bg: 'bg-primary/10', text: 'text-primary', label: 'Dalam Uji' },
  completed: { bg: 'bg-success/10', text: 'text-success', label: 'Selesai' },
  rejected: { bg: 'bg-danger/10', text: 'text-danger', label: 'Ditolak' },
};

const badge = computed(() => statusMap[props.status] ?? statusMap.baru);
const badgeClass = computed(() => `${badge.value.bg} ${badge.value.text}`);
const text = computed(() => badge.value.label);
</script>