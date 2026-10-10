import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Laragon Apache: API di http://localhost/e-commerce/api/...
      // (kalau pakai php -S localhost:8000 -t backend/public, ganti target ke http://localhost:8000 dan hapus rewrite)
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/e-commerce/api'),
      },
    },
  },
})
