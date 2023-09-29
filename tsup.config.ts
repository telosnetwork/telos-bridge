import {polyfillNode} from 'esbuild-plugin-polyfill-node';
import svgrPlugin from 'esbuild-plugin-svgr';
import {defineConfig} from 'tsup';

import packageJSON from './package.json';

export default defineConfig({
  tsconfig: './tsconfig.element.json',
  esbuildPlugins: [
    svgrPlugin(),
    polyfillNode({
      globals: {
        buffer: true,
      },
      polyfills: {
        crypto: true,
      },
    }),
  ],
  entry: ['src/element.tsx'],
  outDir: 'widget',
  sourcemap: false,
  minify: true,
  // treeshake: true,
  platform: 'browser',
  bundle: true,
  target: 'es2020',
  define: {
    global: 'window',
    'process.env.NODE_ENV': '"production"',
  },
  splitting: false,
  external: ['child_process', 'os'],
  format: ['esm'],
  noExternal: [...Object.keys(packageJSON.dependencies)],
});
