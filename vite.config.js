import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
  optimizeDeps: {
    // Pre-bundle Monaco so it loads without source-map 404s
    include: ['monaco-editor/esm/vs/editor/editor.api'],
  },
  build: {
    // Skip source-map generation — Monaco ships huge .map files we don't need
    sourcemap: false,
  },
})