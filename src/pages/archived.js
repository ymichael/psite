import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

import Post from '../components/post'

export default ({ data }) => {
  return (
    <ul>
      <Helmet>
        <title>posts | ymichael</title>
      </Helmet>
      {data.allMarkdownRemark.edges.map(({ node }, idx) => {
        if (!node.frontmatter.archive) {
          return null
        }
        return <Post key={idx} {...node} />
      })}
    </ul>
  )
}

export const query = graphql`
  query PostsQuery2 {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { fileAbsolutePath: { regex: "/data/post/" } }
    ) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            archive
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
