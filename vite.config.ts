import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      // Local dev proxy to avoid CORS when hitting Azure backend
      '/api-upload': {
        target: process.env.VITE_PROXY_TARGET || 'https://allvy-rfp-pythonservice-ang2cfbna2dahmc8.centralindia-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-upload/, '/process-rfp'),
      },
      '/api-status': {
        target: process.env.VITE_PROXY_TARGET || 'https://allvy-rfp-pythonservice-ang2cfbna2dahmc8.centralindia-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-status\//, '/status/'),
      },
      '/api-download': {
        target: process.env.VITE_PROXY_TARGET || 'https://allvy-rfp-pythonservice-ang2cfbna2dahmc8.centralindia-01.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-download\//, '/download/'),
      },
    },
  },
})
