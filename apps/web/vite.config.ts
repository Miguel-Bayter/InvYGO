import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/ygo-api': {
        target: 'https://ygo-api-wrapper-177404616225.us-central1.run.app',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/ygo-api/, '/api'),
      },
    },
  },
})
