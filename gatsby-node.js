/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const path = require(`path`);
const slugify = require('slug');
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === `MarkdownRemark`) {
    // Make slugs compatible with old jekyll links:
    // https://www.gatsbyjs.org/blog/2017-11-08-migrate-from-jekyll-to-gatsby/
    let slug = createFilePath({ node, getNode, basePath: `pages` })

    // Only create slugs for blog posts.
    if (slug.startsWith('/posts/')) {
      slug = slug.slice('/posts'.length);
      const [, date, title] = slug.match(/^\/([\d]{4}-[\d]{2}-[\d]{2})-{1}(.+)\/$/)
      const value = `/${slugify([date], '/')}/${title}.html`
      createNodeField({ node, name: `slug`, value: value });
    } else {
      createNodeField({ node, name: `slug`, value: null });
    }

  }
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  return new Promise((resolve, reject) => {
    graphql(`
      {
        allMarkdownRemark {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `
	).then(result => {
      result.data.allMarkdownRemark.edges.forEach(({ node }) => {
        if (!node.fields.slug) {
          return;
        }

        createPage({
          path: node.fields.slug,
          component: path.resolve(`./src/templates/post.js`),
          context: {
            // Data passed to context is available in page queries as GraphQL variables.
            slug: node.fields.slug,
          },
        })
      })
      resolve()
    })
  })
};