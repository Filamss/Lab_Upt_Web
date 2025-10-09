<template>
  <div>
    <!-- Transisi animasi antar halaman -->
    <transition name="fade" mode="out-in">
      <!-- Tampilkan AppShell hanya bila route tidak berlabel 'auth' atau 'print' pada salah satu matched record -->
      <AppShell v-if="!isAuthLayout">
        <router-view />
      </AppShell>

      <!-- Halaman login / print tanpa AppShell -->
      <router-view v-else />
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppShell from '@/components/AppShell.vue';

const route = useRoute();

// Periksa semua matched route record. Ini defensif terhadap nested routes
const isAuthLayout = computed(() =>
  route.matched.some(
    (r) => r.meta && (r.meta.layout === 'auth' || r.meta.layout === 'print')
  )
);
</script>

<style>
/* === Fade-in transition === */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
