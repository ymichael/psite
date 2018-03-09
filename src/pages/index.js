import React from 'react'
import Link from 'gatsby-link'

class IndexPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = { markdownRemark: { html: '' } }
  }

  componentWillMount() {
    // Run a test to see how Google indexes this page.
    if (typeof window != 'undefined' && window.document) {
      this.setState({ markdownRemark: this.props.data.markdownRemark })
    }
  }

  render() {
    return (
      <div>
        <div
          dangerouslySetInnerHTML={{ __html: this.state.markdownRemark.html }}
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
