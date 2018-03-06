import React from 'react'
import Helmet from 'react-helmet'

import Comments from '../components/comments'

export default ({ data }) => {
  const post = data.markdownRemark
  return (
    <div>
      <article
        className="post"
        itemScope
        itemType="http://schema.org/BlogPosting"
      >
        <Helmet>
          <title>{post.frontmatter.title} - ymichael</title>
        </Helmet>
        <header>
          <time itemProp="datePublished" dateTime="{ post.frontmatter.date }">
            {post.frontmatter.date}
          </time>
          <h1 className="post_title" itemProp="name">
            {post.frontmatter.title}
          </h1>
        </header>
        <section>
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </section>
      </article>
      <br />
      <br />
      <Comments slug={post.fields.slug} />
    </div>
  )
}

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        date(formatString: "DD MMMM, YYYY")
      }
      fields {
        slug
      }
    }
  }
`
