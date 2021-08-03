const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { VanillaExtractPlugin } = require("@vanilla-extract/webpack-plugin");
const {
  getGlobalCssLoader,
} = require("next/dist/build/webpack/config/blocks/css/loaders");
const withMDX = require("@next/mdx")({
  extension: /\.mdx$/,
});

const postCssPlugins = [
  // Below PostCSS references Next.js default configuration
  // https://nextjs.org/docs/advanced-features/customizing-postcss-config#customizing-plugins
  "postcss-flexbugs-fixes",
  [
    "postcss-preset-env",
    {
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
      features: {
        "custom-properties": false,
      },
    },
  ],
];

const nextConfig = withMDX({
  pageExtensions: ["page.tsx", "page.mdx"],

  reactStrictMode: true,
  webpack(config, { dev, isServer }) {
    config.module.rules.push({
      test: /\.css$/i,
      sideEffects: true,
      use: dev
        ? getGlobalCssLoader(
            {
              isClient: !isServer,
              isDevelopment: dev,
            },
            postCssPlugins
          )
        : [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: false,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: postCssPlugins,
                },
              },
            },
          ],
    });

    const plugins = [];

    plugins.push(new VanillaExtractPlugin());
    // plugins.push("babel-plugin-preval");

    if (!dev) {
      plugins.push(
        new MiniCssExtractPlugin({
          filename: "static/css/[contenthash].css",
          chunkFilename: "static/css/[contenthash].css",
          ignoreOrder: true,
        })
      );
    }

    config.plugins.push(...plugins);

    config.resolve.alias["@www"] = path.resolve("./src");
    config.resolve.alias["@infinite-table/infinite-react"] = path.resolve(
      "../source/dist/index.esm.js"
    );
    config.resolve.alias.react = path.resolve("./node_modules/react");
    config.resolve.alias["react-dom"] = path.resolve(
      "./node_modules/react-dom"
    );
    // needed for bundling the ts-compiler for browser usage
    config.resolve.alias["os"] = path.resolve("./build/shims/os-shim.js");
    config.resolve.alias["fs"] = path.resolve("./node_modules/node-browserfs");
    config.resolve.alias["perf_hooks"] = path.resolve(
      "./build/shims/perf_hooks.js"
    );
    config.resolve.alias["path"] = path.resolve(
      "./node_modules/path-browserify"
    );

    return config;
  },
});
const createNextPluginPreval = require("next-plugin-preval/config");
const withNextPluginPreval = createNextPluginPreval();
module.exports = withNextPluginPreval(nextConfig);
