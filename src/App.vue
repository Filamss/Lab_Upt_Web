<template>
  <div>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <!-- Layout tanpa shell -->
        <component v-if="isAuthLayout" :is="Component" />

        <!-- Layout dengan AppShell -->
        <AppShell v-else>
          <component :is="Component" />
        </AppShell>
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/AppShell.vue'

const route = useRoute()

// Deteksi layout tanpa AppShell (auth, print, landing)
const isAuthLayout = computed(() => {
  const standaloneLayouts = ['auth', 'print', 'public']
  return route.matched.some((r) => r.meta && standaloneLayouts.includes(r.meta.layout))
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
