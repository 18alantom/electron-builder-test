import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  if (command === 'build') {
    return { plugins: [vue()], base: 'app://./' };
  }

  return {
    server: { host: '0.0.0.0', port: 3000, strictPort: true },
    plugins: [vue()],
  };
});