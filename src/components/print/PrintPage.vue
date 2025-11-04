<template>
  <div class="print-root p-4 bg-white">
    <component
      v-if="resolvedComponent"
      :is="resolvedComponent"
      :data="dataToPrint"
    />
    <div v-else>
      <!-- loading placeholder -->
      <p>Preparing document...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useKajiUlangStore } from '@/stores/useKajiUlangStore';
import { useRoute } from 'vue-router';

const route = useRoute();
const type = route.params.type;
const id = route.params.id || '';
const dataToPrint = ref(null);

// We'll dynamically import the proper print component and wait for it to resolve
// before triggering window.print() to avoid printing unresolved Promises.
import { ref as vueRef } from 'vue';
const resolvedComponent = vueRef(null);

async function loadPrintComponent() {
  try {
    let mod = null;
    if (!type || type === 'kaji-ulang') {
      mod = await import('./KajiUlangPrint.vue');
    } else if (type === 'form') {
      mod = await import('./FormPrint.vue');
    } else {
      // default fallback
      mod = await import('./KajiUlangPrint.vue');
    }
    resolvedComponent.value = mod.default || mod;
  } catch (e) {
    // fallback to KajiUlangPrint if import fails
    try {
      const m = await import('./KajiUlangPrint.vue');
      resolvedComponent.value = m.default || m;
    } catch (err) {
      // leave null; nothing to render
      console.error('Failed to load print component', err);
    }
  }
}

onMounted(async () => {
  // Try sessionStorage first (set by the calling page)
  try {
    const key = `print:${type}:${id || 'anon'}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      dataToPrint.value = JSON.parse(raw);
      sessionStorage.removeItem(key);
    }
    console.log('[PrintPage] looked for key', key, 'found=', !!raw);
  } catch (e) {
    // ignore parse errors
  }

  // fallback: try to read data passed directly from opener window (same-origin)
  try {
    if (!dataToPrint.value && window.opener && window.opener.__PRINT_DATA__) {
      console.log('[PrintPage] reading data from window.opener.__PRINT_DATA__');
      dataToPrint.value = window.opener.__PRINT_DATA__;
      try {
        delete window.opener.__PRINT_DATA__;
      } catch (e) {
        /* ignore */
      }
    }
  } catch (e) {
    // ignore cross-origin or other access errors
    console.warn('[PrintPage] cannot access window.opener for print data', e);
  }

  // If still no data and we have an id (orderNo), try loading from order store
  try {
    if (!dataToPrint.value && id) {
      const orderStore = useKajiUlangStore();
      // try to find by orderNo or numeric id
      const byOrderNo = orderStore.orders.find((o) => o.orderNo === id);
      const byId = orderStore.orders.find((o) => String(o.id) === String(id));
      const found = byOrderNo || byId;
      if (found) {
        console.log('[PrintPage] loaded data from orderStore for', id);
        // map order to print shape expected by KajiUlangPrint
        dataToPrint.value = {
          orderNo: found.orderNo,
          sampleNo: found.sampleNo || '',
          date: found.date || '',
          customerName: found.customerName || '',
          address: found.address || '',
          testType: found.testType || '',
          note: found.note || '',
          kajiUlangRows: found.kajiUlangRows || [],
        };
      }
    }
  } catch (e) {
    console.warn('[PrintPage] error loading from order store', e);
  }

  // Load the component and wait for it to be ready
  await loadPrintComponent();

  // wait for component render
  await nextTick();

  // If no data to print, show a message and do not call print()
  if (!dataToPrint.value) {
    console.warn('[PrintPage] no data to print, aborting print()');
    return;
  }

  // Trigger print dialog
  window.print();

  // If this window was opened programmatically, attempt to close it after printing
  window.onafterprint = () => {
    try {
      window.close();
    } catch (e) {
      /* ignore */
    }
  };
});
</script>

<style scoped>
.print-root {
  background: white;
  color: #000;
}
@media print {
  body {
    background: white !important;
  }
}
</style>
