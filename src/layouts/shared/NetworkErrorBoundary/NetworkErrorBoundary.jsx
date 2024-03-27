import { useQueryClient } from '@tanstack/react-query'
import cs from 'classnames'
import PropTypes from 'prop-types'
import { Component, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import config from 'config'

import A from 'ui/A'
import Button from 'ui/Button'

import img401 from './assets/error-401.svg'
import img403 from './assets/error-403.svg'
import img404 from './assets/error-404.svg'
import img500 from './assets/error-500.svg'
import styles from './NetworkErrorBoundary.module.css'
import {
  sendGraphQLErrorMetrics,
  sendNetworkErrorMetrics,
} from './networkErrorMetrics'

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

export const NetworkErrorMessage = () => {
  if (config.IS_SELF_HOSTED) {
    return (
      <p className="my-4 px-3 sm:px-0">
        Please see{' '}
        <A
          rel="noreferrer"
          className="text-blue-400"
          href="https://docs.codecov.io/"
          isExternal={true}
          hook="docs"
        >
          our docs
        </A>{' '}
        for common support.
      </p>
    )
  }

  return (
    <p className="my-4 px-3 sm:px-0">
      Check on{' '}
      <A
        rel="noreferrer"
        className="text-blue-400"
        href="https://status.codecov.io/"
        isExternal={true}
        hook="status"
      >
        Codecov&apos;s status
      </A>{' '}
      or see{' '}
      <A
        rel="noreferrer"
        className="text-blue-400"
        href="https://docs.codecov.io/"
        isExternal={true}
        hook="docs"
      >
        our docs
      </A>{' '}
      for common support.
    </p>
  )
}

function ResetHandler({ reset }) {
  const queryClient = useQueryClient()
  const history = useHistory()

  useEffect(() => {
    let unMounted = false
    const unListen = history.listen(() => {
      if (unMounted) return
      queryClient.clear()
      reset()
    })

    return () => {
      unMounted = true
      unListen()
    }
  }, [history, queryClient, reset])

  return (
    <div className="my-4">
      <Button
        onClick={() => {
          queryClient.clear()
          history.goBack()
          reset()
        }}
      >
        Return to previous page
      </Button>
    </div>
  )
}

ResetHandler.propTypes = {
  reset: PropTypes.func,
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
    // if the error is not a network error, we don't do anything and
    // another error boundary will take it from there
    if (Object.keys(errorToUI).includes(String(error.status))) {
      sendNetworkErrorMetrics(error.status)
      return { hasNetworkError: true, error }
    }

    if (Object.keys(graphQLErrorToUI).includes(error.__typename)) {
      sendGraphQLErrorMetrics(error.__typename)
      return { hasGraphqlError: true, error }
    }

    return {}
  }

  resetErrorBoundary = () => {
    this.reset()
  }

  reset() {
    this.setState({
      hasNetworkError: false,
      hasGraphqlError: false,
      error: null,
    })
  }

  renderGraphQLError() {
    const { error } = this.state
    const { illustration, title } = graphQLErrorToUI[error.__typename]

    return (
      <article className="mx-auto flex h-full flex-col items-center justify-center">
        <img
          alt="illustration error"
          className={cs(styles.illustrationError, 'mx-auto')}
          src={illustration}
        />
        <h1 className="mt-6 text-2xl">{title}</h1>
        <NetworkErrorMessage />
        <ResetHandler reset={this.resetErrorBoundary} />
      </article>
    )
  }

  renderError() {
    const { status, data } = this.state.error
    const { illustration, title, description } = errorToUI[status]

    return (
      <article className="mx-auto flex h-full flex-col items-center justify-center">
        <img
          alt="illustration error"
          className={cs(styles.illustrationError, 'mx-auto')}
          src={illustration}
        />
        <h1 className="mt-6 text-2xl">{title}</h1>
        {description && <p className="mt-6">{description(data)}</p>}
        <NetworkErrorMessage />
        <p>
          <strong>Error {status}</strong>
        </p>
        <ResetHandler reset={this.resetErrorBoundary} />
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
