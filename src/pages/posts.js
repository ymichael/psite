import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

export default ({ data }) => {
  return (
    <ul>
      <Helmet>
        <title>posts | ymichael</title>
      </Helmet>
      {data.allMarkdownRemark.edges.map(({ node }) => (
        <li key={node.id}>
          <article
            className="post"
            itemScope
            itemType="http://schema.org/BlogPosting"
          >
            <header>
              <time
                itemProp="datePublished"
                dateTime="{ node.frontmatter.date }"
              >
                {node.frontmatter.date}
              </time>
              <h1 itemProp="name" className="post_title">
                <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
              </h1>
            </header>
            <section>
              {node.excerpt}
              <Link to={node.fields.slug} itemProp="url" className="readmore">
                Read More...
              </Link>
            </section>
          </article>
        </li>
      ))}
    </ul>
  )
}

export const query = graphql`
  query PostsQuery {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/data/post/" } }
    ) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`
