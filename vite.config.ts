import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src'),
    },
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: false,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
