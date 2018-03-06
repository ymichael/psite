import React from 'react'
import Link from 'gatsby-link'

export default (data) => (
  <li key={data.id}>
    <article
      className="post"
      itemScope
      itemType="http://schema.org/BlogPosting"
    >
      <header>
        <time
          itemProp="datePublished"
          dateTime="{ data.frontmatter.date }"
        >
          {data.frontmatter.date}
        </time>
        <h1 itemProp="name" className="post_title">
          <Link to={data.fields.slug}>{data.frontmatter.title}</Link>
        </h1>
      </header>
      <section>
        {data.excerpt}
        <Link to={data.fields.slug} itemProp="url" className="readmore">
          Read More...
        </Link>
      </section>
    </article>
  </li>
)