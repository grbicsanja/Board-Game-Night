import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serverTarget = `http://localhost:${process.env.SERVER_PORT || 3001}`;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': serverTarget,
      '/socket.io': {
        target: serverTarget,
        ws: true,
      },
    },
  },
});
