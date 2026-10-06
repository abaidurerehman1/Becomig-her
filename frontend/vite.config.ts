import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Node global; declared here so the config doesn't need @types/node.
declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // override with API_PROXY=http://127.0.0.1:<port> to point at another backend
      '/api': process.env.API_PROXY ?? 'http://127.0.0.1:8000',
    },
  },
})
