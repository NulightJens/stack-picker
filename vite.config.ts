import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: '.',
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, 'src/client'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
