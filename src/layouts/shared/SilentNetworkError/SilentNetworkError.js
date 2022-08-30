import PropTypes from 'prop-types'
import { Component } from 'react'

// If this component is not working try wrapping it in a Suspense wrapper. (Lookup other implementations)
class SilentNetworkError extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasNetworkError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Suppress flags rest endpoint when it errors.
    if (error.status) {
      return { hasNetworkError: true, error }
    }
    return {}
  }

  render() {
    if (this.state.hasNetworkError) return this.props.fallback || null
    return <>{this.props.children}</>
  }
}

SilentNetworkError.propTypes = {
  fallback: PropTypes.element,
}

export default SilentNetworkError
