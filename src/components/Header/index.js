import React from 'react'
import Link from 'gatsby-link'

const Header = ({ pathname }) => {
  let isStandalonePost = pathname.endsWith('.html')
  if (!isStandalonePost) {
    return (
      <div>
        <header>
          <a href="/">
            <h1>
              <strong>y</strong>
              <span>michael</span>
            </h1>
          </a>
        </header>
      </div>
    )
  }
  return (
    <nav>
      <ul>
        <li className="navlink">
          <Link to="/">~/</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Header
