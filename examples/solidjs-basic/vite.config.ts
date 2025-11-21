import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      '@tendant/simple-idm-solid': path.resolve(__dirname, '../../src/index.ts'),
      '~': path.resolve(__dirname, '../../src'),
    },
  },
  server: {
    port: 3000,
  },
});
