import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // /ygo-api/v1/cards → https://ygo-api-wrapper-.../api/v1/cards
      '/ygo-api': {
        target: 'https://ygo-api-wrapper-177404616225.us-central1.run.app',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/ygo-api/, '/api'),
      },
    },
  },
})
