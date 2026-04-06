import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {mediaPlayerLibraryPlugin} from './src/plugins/mediaPlayerLibraryPlugin';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const rootDir = path.resolve(__dirname);
  return {
    plugins: [react(), tailwindcss(), mediaPlayerLibraryPlugin(rootDir)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // jsmediatags package.json "browser" points to a non-published dist file; point bundler at CJS build.
        jsmediatags: path.resolve(__dirname, 'node_modules/jsmediatags/build2/jsmediatags.js'),
        // esbuild follows require('./ReactNativeFileReader') → react-native-fs (not a web dependency).
        'react-native-fs': path.resolve(__dirname, 'src/shims/react-native-fs.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
