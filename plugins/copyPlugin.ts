import * as esbuild from 'esbuild';
import path from 'node:path';
import fs from 'node:fs/promises';
import { glob } from 'glob';

interface Option {
  baseDir?: string;
  baseOutDir?: string;
  ignoreDirs?: string[];
  files: {
    from: string;
    to: string;
  }[];
}

/**
 * A plugin that copies files specified by `option`. Example:
 * ```
 * copyPlugin({
 *   // base directory of source files
 *   baseDir: './src',
 *   // base directory of destination files
 *   baseOutDir: './dist',
 *   // directory ignored by wild card (see: npm:glob)
 *   ignoreDirs: ['./cache'],
 *   // files should be copied
 *   files: [
 *     { from: 'imgs/*', to: 'imgs/[name].[ext]' },
 *     { from: 'wasm/*', to: 'wasm/[name].[ext]' },
 *   ]
 * })
 * ```
 */
const copyPlugin = (option: Option): esbuild.Plugin => {
  const baseDir = option.baseDir ?? '.';
  const baseOutDir = option.baseOutDir ?? '';
  const ignoreDirs = ['node_modules', ...(option.ignoreDirs ?? [])];

  return {
    name: 'copy-plugin',
    setup(build) {
      build.onStart(async () => {
        const promises = [];

        for (const file of option.files) {
          const fromFiles = await glob(file.from, {
            ignore: ignoreDirs,
          });

          for (const fromFile of fromFiles) {
            const dirname = path.dirname(
              path.relative(baseDir, path.resolve(fromFile))
            );
            const path_ = path.join(baseOutDir, dirname);
            const name = path.basename(fromFile).replace(/\.[^/.]+$/, '');
            const ext = path.extname(fromFile).slice(1);
            const toFile = path.join(
              baseOutDir,
              file.to
                .replace('[path]', path_)
                .replace('[name]', name)
                .replace('[ext]', ext)
            );

            await fs
              .stat(path_)
              .then((stats) => {
                if (!stats.isDirectory()) {
                  throw Error(
                    `${path_} is already exists, whereas it is not a directory.`
                  );
                }
              })
              .catch((error) => {
                if (error.code === 'ENOENT') {
                  return fs.mkdir(path_, { recursive: true });
                }
                throw error;
              });

            promises.push(fs.copyFile(fromFile, toFile));
          }
        }

        await Promise.all(promises);
      });
    },
  };
};

export default copyPlugin;
