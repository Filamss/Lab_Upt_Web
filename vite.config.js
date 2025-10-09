import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

/**
 * Vite configuration for the UPT Laboratory dashboard.
 *
 * This configuration uses the Vue plugin and sets up a simple alias so
 * you can import from your `src` directory using `@/` rather than
 * relative paths.
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});