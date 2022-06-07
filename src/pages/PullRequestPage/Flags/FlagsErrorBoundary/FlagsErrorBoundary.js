import { Component } from 'react'

class FlagsErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasNetworkError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Supress flags rest endpoint when it errors.
    if (error.status) {
      return { hasNetworkError: true, error }
    }
    return {}
  }

  render() {
    if (this.state.hasNetworkError) return null
    return <>{this.props.children}</>
  }
}

export default FlagsErrorBoundary
