import React from 'react'
import Link from 'gatsby-link'

const IndexPage = ({ data }) => (
  <div>
    <div dangerouslySetInnerHTML={{ __html: data.markdownRemark.html }} />
  </div>
)

export default IndexPage

export const query = graphql`
  query IndexQuery {
    markdownRemark(id: { regex: "/data/about.md/" }) {
      html
    }
  }
`
