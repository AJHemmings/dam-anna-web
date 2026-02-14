import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into its own chunk so the main app loads faster
          three: ['three'],
        },
      },
    },
  },
})