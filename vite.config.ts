import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web', 'solid-js/store'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'styles/default.css';
          }
          return assetInfo.name || 'asset';
        },
      },
    },
    sourcemap: true,
    minify: false, // Let consumers handle minification
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
});
