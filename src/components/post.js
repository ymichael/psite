import React from 'react'
import Link from 'gatsby-link'

export default data => (
  <li key={data.id}>
    <article
      className="post"
      itemScope
      itemType="http://schema.org/BlogPosting"
    >
      <header>
        <time itemProp="datePublished" dateTime="{ data.frontmatter.date }">
          {data.frontmatter.date}
        </time>
        <h1 itemProp="name" className="post_title">
          {data.fields.slug ? <Link to={data.fields.slug}>{data.frontmatter.title}</Link> : (
            <a target="_blank" href={data.frontmatter.url}>{data.frontmatter.title}
              <span className="external_link">🔗</span>
            </a>
          )}
        </h1>
      </header>
    </article>
  </li>
)
