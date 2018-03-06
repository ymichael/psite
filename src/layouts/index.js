import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Header from '../components/Header'
import Analytics from '../components/analytics'

// TODO(michael): Clean this up
import './base.css'
import './prism-coy.css'

const TemplateWrapper = ({ children, location }) => {
  return (
    <div>
      <Helmet>
        <title>ymichael</title>
        <link
          href="//fonts.googleapis.com/css?family=Josefin+Sans:400,600"
          rel="stylesheet"
          type="text/css"
        />
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="viewport" content="width=device-width" />
      </Helmet>
      <div className="container">
        <Header pathname={location.pathname} />
        <div className="static_content">{children()}</div>
      </div>
      <Analytics />
    </div>
  )
}

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper
