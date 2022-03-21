import { defineConfig } from 'vite';
// import prefresh from '@prefresh/vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // esbuild: {
  //   jsxFactory: 'h',
  //   jsxFragment: 'Fragment',
  //   jsxInject: `import { h, Fragment} from 'preact'`,
  // },
  publicDir: 'public',
});
