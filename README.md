# ASH_PJ

https://masirof.github.io/ASH_PJ/

## How to build

### Production and development build

```shell
# production build
$npm run build
# development build (in-line source map)
$npm run dev
# development build with watch
$npm run watch
```

### Linting and formatting

```shell
# lint
$npm run lint
# format
$npm run fmt
```

## Project overview

This web application is bundled with [esbuild](https://esbuild.github.io/).
[Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) is used as code formatter and linter, respectively.

### Directories

- `.github`: Configurations related with GitHub
  - `workflows`: GitHub actions' workflows
- `data`: Data used by web page
  - `tweets.json`: Dictionary of images and source urls
- `dist`: Build destination directory
- `node_modules`: Node.js modules
- `plugins`: esbuild plugins
- `src`: web page sources
  - `imgs`: image resources
  - `script`: script resources
  - `style`: stylesheet resources
