import react from '@vitejs/plugin-react';
import { glob } from 'glob';
import { fileURLToPath } from 'node:url';
import { extname, relative, resolve } from 'path';
import path from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import progress from 'vite-plugin-progress';

export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    dts({ include: ['lib'] }),
    checker({
      typescript: true,
    }),
    progress({
      format: 'Building lib [:bar] :percent',
      total: 200,
      width: 60,
      complete: '=',
      incomplete: '',
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      input: Object.fromEntries(
        glob.sync('lib/**/*.{ts,tsx}').map(file => [
          relative('lib', file.slice(0, file.length - extname(file).length)),
          fileURLToPath(new URL(file, import.meta.url)),
        ])
      ),
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: '[name].js',
      },
    },
  },
  resolve: {
    alias: {
      '@helpers': path.resolve(__dirname, './lib/helpers'),
      '@hooks': path.resolve(__dirname, './lib/hooks'),
      '@libs': path.resolve(__dirname, './lib/libs'),
      '@types': path.resolve(__dirname, './lib/types'),
      '@ui': path.resolve(__dirname, './lib/ui'),
    },
  },
});
