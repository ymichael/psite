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
        <nav>
          <ul>
            <li className="navlink">
              <Link to="/posts">posts</Link>
            </li>
            <li className="navlink">
              <a target="_blank" href="mailto:wrong92@gmail.com">
                say hi
              </a>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
  return (
    <nav>
      <ul>
        <li className="navlink">
          <Link to="/">~/</Link>
        </li>
        <li className="navlink">
          <Link to="/posts">posts</Link>
        </li>
        <li className="navlink">
          <a target="_blank" href="mailto:wrong92@gmail.com">
            say hi
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Header
