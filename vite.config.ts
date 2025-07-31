import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@capacitor/app',
      '@capacitor/camera',
      '@capacitor/clipboard',
      '@capacitor/core',
      '@capacitor/device',
      '@capacitor/geolocation',
      '@capacitor/haptics',
      '@capacitor/network',
      '@capacitor/share',
      '@capacitor/toast',
      '@capacitor-community/barcode-scanner'
    ]
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        waitlist: 'waitlist.html'
      }
    }
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: {
      clientPort: 443 // This is needed for HMR to work in some environments
    }
  }
});