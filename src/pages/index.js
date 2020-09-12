import React from 'react'
import Link from 'gatsby-link'

class IndexPage extends React.Component {
  render() {
    return (
      <div>
        <div
          dangerouslySetInnerHTML={{ __html: this.props.data.markdownRemark.html }}
        />
      </div>
    )
  }
}

export default IndexPage

export const query = graphql`
  query IndexQuery {
    markdownRemark(id: { regex: "/data/about.md/" }) {
      html
    }
  }
`
