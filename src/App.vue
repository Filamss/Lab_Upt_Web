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

// Deteksi layout auth / print
const isAuthLayout = computed(() =>
  route.matched.some(
    (r) => r.meta && (r.meta.layout === 'auth' || r.meta.layout === 'print')
  )
)
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
