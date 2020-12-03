import { Component } from 'react'
import cs from 'classnames'

import img401 from './assets/error-401.svg'
import styles from './NetworkErrorBoundary.module.css'

const errorToUI = {
  401: {
    illustration: img401,
    title: (
      <>
        Please <a href="/login">log in.</a>
      </>
    ),
  },
  403: {
    illustration: img401,
    title: (
      <>
        Please <a href="/login">log in.</a>
      </>
    ),
  },
}

class NetworkErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasNetworkError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    if (Object.keys(errorToUI).includes(String(error.status))) {
      return { hasNetworkError: true, error }
    }
    return {}
  }

  renderError() {
    console.log(this.state.error)
    const { status, data } = this.state.error
    const { illustration, title } = errorToUI[status]

    return (
      <div className="col-start-1 col-end-13 flex items-center justify-center flex-col">
        <img
          alt="illustration error"
          className={cs(styles.illustrationError, 'mx-auto')}
          src={illustration}
        />
        <h1 className="text-2xl my-6">{title}</h1>
        <p>{data.detail}</p>
        <p className="my-4">
          Check on{' '}
          <a
            rel="noreferrer"
            className="text-blue-400"
            href="https://status.codecov.io/"
            target="_blank"
          >
            Codecov’s status
          </a>{' '}
          or see{' '}
          <a
            rel="noreferrer"
            className="text-blue-400"
            href="https://docs.codecov.io/"
            target="_blank"
          >
            our docs
          </a>{' '}
          for common support.
        </p>
        <p>
          <strong>Error {status}</strong>
        </p>
      </div>
    )
  }

  render() {
    if (this.state.hasNetworkError) return this.renderError()
    return this.props.children
  }
}

export default NetworkErrorBoundary
