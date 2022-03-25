import { defineConfig } from 'vite';
// import prefresh from '@prefresh/vite';
import react from '@vitejs/plugin-react';
import VitePluginReactRemoveAttributes from 'vite-plugin-react-remove-attributes';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginReactRemoveAttributes({ attributes: ['data-testid'] }),
  ],
  // esbuild: {
  //   jsxFactory: 'h',
  //   jsxFragment: 'Fragment',
  //   jsxInject: `import { h, Fragment} from 'preact'`,
  // },
  publicDir: 'public',
});
