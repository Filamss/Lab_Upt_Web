<template>
  <div>
    <h2 class="text-xl font-semibold mb-4">Validasi Manajer Teknis</h2>
    <!-- Header Info -->
    

    <!-- Actions -->
    <div class="flex gap-4">
      <button
        class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        @click="kembalikan"
      >
        Kembalikan ke Admin
      </button>
      <button
        class="bg-primary text-white px-4 py-2 rounded-lg"
        @click="kirimKePenyelia"
      >
        Kirim ke Penyelia
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '@/stores/useOrderStore';
import { useTestStore } from '@/stores/useTestStore';
import { useUserStore } from '@/stores/useUserStore';


function kembalikan() {
  // Set status back to admin
  if (order.value) {
    orderStore.setStatus(order.value.id, 'pending_validation');
    alert('Dikembalikan ke Admin');
  }
}

function kirimKePenyelia() {
  if (order.value) {
    // Save assignments to order
    orderStore.assignStaff(order.value.id, {
      supervisorId: assignments.supervisorId,
      technicianId: assignments.technicianId,
    });
    orderStore.setStatus(order.value.id, 'in_testing');
    router.push({ path: '/kartu-kendali', query: { orderId: order.value.id } });
  }
}
</script>
