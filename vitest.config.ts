import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': '.',
      '@': '.',
      // '#build': './.nuxt', // エイリアスを追加
    },
  },
  test: {
    environment: 'jsdom', // テスト環境の指定
    globals: true,
    // environmentOptions: {
    //   resources: 'usable',  // リソースの読み込みを制限
    // },
    // setupFiles: './tests/setup.ts', // テストのセットアップファイルを指定
  },
})
