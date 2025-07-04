import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Note: '@tailwindcss/vite' is not a standard plugin; use 'postcss' integration instead
export default defineConfig({
  plugins: [react()],
})