import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: use your repo name here since GitHub Pages serves under /<repo>/
  base: '/recipegrind/',
})
