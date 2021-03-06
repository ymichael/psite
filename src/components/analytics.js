import React from 'react'

class GoogleAnalytics extends React.Component {
  componentWillMount() {
    if (typeof window != 'undefined' && window.document) {
      // Google Analytics.
      ;(function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r
        ;(i[r] =
          i[r] ||
          function() {
            ;(i[r].q = i[r].q || []).push(arguments)
          }),
          (i[r].l = 1 * new Date())
        ;(a = s.createElement(o)), (m = s.getElementsByTagName(o)[0])
        a.async = 1
        a.src = g
        m.parentNode.insertBefore(a, m)
      })(
        window,
        document,
        'script',
        '//www.google-analytics.com/analytics.js',
        'ga'
      )
      ga('create', 'UA-32478148-1', 'ymichael.com')
      ga('send', 'pageview')
    }
  }

  render() {
    return <div id="google-analytics" />
  }
}

export default GoogleAnalytics
