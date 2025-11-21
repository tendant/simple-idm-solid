import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist/styles-temp',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        styles: resolve(__dirname, 'src/styles/entry.ts'),
      },
      output: {
        assetFileNames: '[name].css',
      },
    },
  },
});
