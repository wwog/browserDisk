import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { readdirSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

const extensionDir = resolve(__dirname, '../../extension');
const distDir = resolve(extensionDir, 'renderer');

const isDev = process.env.NODE_ENV === 'development';
const entryDir = resolve(__dirname, 'entrys');
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
    writeToDisk: (filePath) => {
      // 排除热重载相关的文件
      const excludePatterns = [
        /\.hot-update\.js$/, // 排除 .hot-update.js 文件
        /\.hot-update\.json$/, // 排除 .hot-update.json 文件
        /\.hot-update\.js\.map$/, // 排除.hot-update.js.map 文件
      ];

      // 检查文件路径是否匹配排除规则
      return !excludePatterns.some((pattern) => pattern.test(filePath));
    },
    assetPrefix: './',
  },
});
