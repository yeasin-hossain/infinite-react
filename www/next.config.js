const path = require('path');

// const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
// const withVanillaExtract = createVanillaExtractPlugin();

// const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
// const withVanillaExtract = createVanillaExtractPlugin();
// const { remarkPlugins } = require('./plugins/markdownToHtml');
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  // remarkPlugins,
  providerImportSource: '@mdx-js/react',
});

// const withMDX = (x) => x;

const spawnSync = require('child_process').spawnSync;

const exec = (cmd, args = []) => spawnSync(cmd, args, { stdio: 'pipe' });

const result = exec('npm', [
  'show',
  '@infinite-table/infinite-react',
  'versions',
  '--json',
]);

const versions = JSON.parse(result.stdout);

// TODO AFL: retrieve latest canary for NEXT, latest stable for master, NEXT_PUBLIC_INFINITE_REACT_VERSION for everything else
const NEXT_PUBLIC_INFINITE_REACT_VERSION =
  process.env.NEXT_PUBLIC_INFINITE_REACT_VERSION || versions.pop();

let nextConfig = withMDX({
  env: {
    NEXT_PUBLIC_INFINITE_REACT_VERSION,
    // NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // pageExtensions: ['page.tsx', 'page.mdx', 'page.md'],
  // rewrites() {
  //   return [
  //     {
  //       source: '/feed.xml',
  //       destination: '/_next/static/feed.xml',
  //     },
  //   ];
  // },
  images: {
    unoptimized: true,
  },
  output: 'export',
  // exportTrailingSlash: true,
  experimental: {
    externalDir: true,
    appDir: true,
    // mdxRs: true,
  },
  // transpilePackages: ['@infinite-table/infinite-react'],
});
const { withContentlayer } = require('next-contentlayer');

nextConfig = withContentlayer(nextConfig);
// the redirects are added by the contentlayer plugin
// as a way to force building the pages, but we don't want that
// as we call the contentlayer CLI ourselves
delete nextConfig.redirects;

module.exports = nextConfig;
// module.exports = nextConfig;
