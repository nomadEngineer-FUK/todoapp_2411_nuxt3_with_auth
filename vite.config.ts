// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': '.',
      '@': '.',
      // '#build': '/.nuxt',
    },
  },
  optimizeDeps: {
    // esbuildのバンドルを避ける設定
    exclude: ['esbuild'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
