import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { createRequire } from 'module';

const extensionDir = resolve(__dirname, '../../extension');
const distDir = resolve(extensionDir, 'renderer');

const isDev = process.env.NODE_ENV === 'development';
const entryDir = resolve(__dirname, 'entries');
const entryFiles = readdirSync(entryDir).reduce((acc, file) => {
  const filename = basename(file, extname(file));
  acc[filename] = resolve(entryDir, file);
  return acc;
}, {} as Record<string, string>);
console.log('[RunTime Config] isDev:', isDev);
console.log('[RunTime Config] entry:', entryFiles);

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: entryFiles,
  },
  output: {
    cleanDistPath: true,
    distPath: {
      root: distDir,
      js: '.',
      css: '.',
    },
    assetPrefix: './',
    filename: {
      js: '[name].js',
      html: '[name].html',
      css: '[name].css',
    },
    legalComments: 'none',
  },
  dev: {
    hmr: false,
    liveReload: false,
    writeToDisk: (filePath) => {
      const excludePatterns = [
        /\.hot-update\.js$/,
        /\.hot-update\.json$/,
        /\.hot-update\.js\.map$/,
      ];

      return !excludePatterns.some((pattern) => pattern.test(filePath));
    },
    assetPrefix: './',
  },
  server: {
    port: 3101,
  },
});
