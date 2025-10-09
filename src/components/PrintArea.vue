<template>
  <div class="print-area">
    <slot />
  </div>
</template>

<script setup>
// This component simply wraps its content in a container that can be
// targeted by print-specific styles.  When printing, you can hide
// other elements and show this area only.
</script>

<style scoped>
@media print {
  .print-area {
    display: block;
  }
}
</style>