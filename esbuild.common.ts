import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import path from 'node:path';
import buildResultPlugin from './plugins/buildResultPlugin';
import copyPlugin from './plugins/copyPlugin';

const srcPath = path.join(__dirname, 'src');
const destPath = path.join(__dirname, 'dist');

// const copyFiles

const config: Partial<esbuild.BuildOptions> = {
  entryPoints: [
    path.join(srcPath, 'index.html'),
    path.join(srcPath, 'script/index.ts'),
    path.join(srcPath, 'style/index.scss'),
    path.join(srcPath, 'ash_web.html'),
    path.join(srcPath, 'script/ash_web.ts'),
    path.join(srcPath, 'style/ash_web.scss'),
  ],
  bundle: true,
  outdir: destPath,
  platform: 'browser',
  loader: {
    '.html': 'copy',
  },
  plugins: [
    copyPlugin({
      baseDir: srcPath,
      baseOutDir: destPath,
      files: [
        { from: path.join(srcPath, 'imgs/*'), to: 'imgs/[name].[ext]' },
      ],
    }),
    copyPlugin({
      baseDir: __dirname,
      baseOutDir: destPath,
      files: [
        { from: path.join(__dirname, 'data/tweets.json'), to: 'data/[name].[ext]' },
      ]
    }),
    sassPlugin(),
    buildResultPlugin(),
  ],
};

export default config;
