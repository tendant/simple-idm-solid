import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    solid(),
    tailwindcss(),
  ],
  server: {
    proxy: {
     '/api/v1/idm' : {
       target: 'http://localhost:4000',
       changeOrigin: true
     }
    }
  },
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
