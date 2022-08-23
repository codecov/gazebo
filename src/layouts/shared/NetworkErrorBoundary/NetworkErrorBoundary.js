import cs from 'classnames'
import { Component } from 'react'

import config from 'config'

import img401 from './assets/error-401.svg'
import img403 from './assets/error-403.svg'
import img404 from './assets/error-404.svg'
import img500 from './assets/error-500.svg'
import styles from './NetworkErrorBoundary.module.css'

const errorToUI = {
  401: {
    illustration: img401,
    title: <a href="/login">Please log in.</a>,
    description: (data) => data.detail,
  },
  403: {
    illustration: img403,
    title: 'Unauthorized',
    description: (data) => data.detail,
  },
  404: {
    illustration: img404,
    title: 'Not found',
    description: null,
  },
  500: {
    illustration: img500,
    title: 'Server error',
    description: null,
  },
}

const graphQLErrorToUI = {
  UnauthenticatedError: {
    illustration: img401,
    title: <a href="/login">Please log in.</a>,
  },
  UnauthorizedError: {
    illustration: img403,
    title: 'Unauthorized',
  },
  NotFoundError: {
    illustration: img404,
    title: 'Not found',
  },
}

const NetworkErrorMessage = () => {
  if (config.IS_ENTERPRISE) {
    return (
      <p className="my-4 px-3 sm:px-0">
        Please see{' '}
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
    )
  }

  return (
    <p className="my-4 px-3 sm:px-0">
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
  )
}

class NetworkErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasNetworkError: false,
      hasGraphqlError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error) {
    // if the error isnt a network error, we don't do anything and
    // another error boundary will take it from there
    if (Object.keys(errorToUI).includes(String(error.status))) {
      return { hasNetworkError: true, error }
    }
    if (Object.keys(graphQLErrorToUI).includes(error.__typename))
      return { hasGraphqlError: true, error }
    return {}
  }

  renderGraphQLError() {
    const { error } = this.state
    const { illustration, title } = graphQLErrorToUI[error.__typename]

    return (
      <article className="h-full mx-auto flex items-center justify-center flex-col">
        <img
          alt="illustration error"
          className={cs(styles.illustrationError, 'mx-auto')}
          src={illustration}
        />
        <h1 className="text-2xl mt-6">{title}</h1>
        <NetworkErrorMessage />
      </article>
    )
  }

  renderError() {
    const { status, data } = this.state.error
    const { illustration, title, description } = errorToUI[status]

    return (
      <article className="h-full mx-auto flex items-center justify-center flex-col">
        <img
          alt="illustration error"
          className={cs(styles.illustrationError, 'mx-auto')}
          src={illustration}
        />
        <h1 className="text-2xl mt-6">{title}</h1>
        {description && <p className="mt-6">{description(data)}</p>}
        <NetworkErrorMessage />
        <p>
          <strong>Error {status}</strong>
        </p>
      </article>
    )
  }

  render() {
    if (this.state.hasNetworkError) return this.renderError()
    if (this.state.hasGraphqlError) return this.renderGraphQLError()
    return <>{this.props.children}</>
  }
}

export default NetworkErrorBoundary
