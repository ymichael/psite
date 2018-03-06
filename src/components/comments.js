import React from 'react'

class Disqus extends React.Component {
  constructor(props) {
    super(props)
    this.state = props
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }

  componentWillMount() {
    if (typeof window != 'undefined' && window.document) {
      const component = this
      window.disqus_config = function() {
        this.page.url = component.state.url
      }

      const script = document.createElement('script')
      script.src = `//ymichael.disqus.com/embed.js`
      script.async = true
      document.body.appendChild(script)
    }
  }

  render() {
    return <div id="disqus_thread" />
  }
}

const Comments = ({ slug }) => {
  return <Disqus url={'https://ymichael.com' + slug} />
}

export default Comments
