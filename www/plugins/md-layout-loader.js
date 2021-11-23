const fm = require('gray-matter');

const toUpperFirst = (str) => {
  return str[0] + str.slice(1);
};

// Makes mdx in next.js suck less by injecting necessary exports so that
// the docs are still readable on github.
//
// Layout component for a .mdx or .md page can be specified in the frontmatter.
// This plugin assumes that the layout file and named export are the same. This
// easily changed by modifying the string below.
//
// All metadata can be written in yaml front matter. It will be passed to the
// layout component as `meta` prop.
//
// (Shamelessly stolen from Expo.io docs)
// @see https://github.com/expo/expo/blob/master/docs/common/md-loader.js
module.exports = async function (src) {
  const callback = this.async();
  const { content, data } = fm(src);
  console.log({ data });
  const layout = data.layout || 'Learn';

  const code =
    `import withLayout from '@www/components/Layout/Layout${toUpperFirst(
      layout
    )}';

export default withLayout(${JSON.stringify(data)})


` + content;

  return callback(null, code);
};
