// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  base: '/', // Update if hosting in a subdirectory
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // Automatically opens the browser
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to true if you need source maps
    minify: 'esbuild', // or 'terser' for more optimization
    // Additional build options can be added here
  },
});
