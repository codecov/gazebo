import { useQueryClient } from '@tanstack/react-query'
import cs from 'classnames'
import PropTypes from 'prop-types'
import { Component, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import config from 'config'

import { useUser } from 'services/user'
import A from 'ui/A'
import Button from 'ui/Button'

import openUmbrella from './assets/error-open-umbrella.svg'
import upsideDownUmbrella from './assets/error-upsidedown-umbrella.svg'
import styles from './NetworkErrorBoundary.module.css'

const errorToUI = {
  400: {
    illustration: upsideDownUmbrella,
    title: 'Bad Request',
    description: null,
    showDocs: true,
  },
  401: {
    illustration: openUmbrella,
    title: <a href="/login">Please log in.</a>,
    description: (data) => data.detail,
    showDocs: true,
  },
  403: {
    illustration: upsideDownUmbrella,
    title: 'Unauthorized',
    description: (data) => data.detail,
    showDocs: true,
  },
  404: {
    illustration: upsideDownUmbrella,
    title: 'Not found',
    description: null,
    showDocs: true,
  },
  429: {
    illustration: upsideDownUmbrella,
    title: 'Rate limit exceeded',
    description: (data) => data.detail,
    showDocs: false,
  },
  500: {
    illustration: upsideDownUmbrella,
    title: 'Server error',
    description: null,
    showDocs: true,
  },
}

const graphQLErrorToUI = {
  UnauthenticatedError: {
    illustration: openUmbrella,
    title: <a href="/login">Please log in.</a>,
  },
  UnauthorizedError: {
    illustration: upsideDownUmbrella,
    title: 'Unauthorized',
  },
  NotFoundError: {
    illustration: upsideDownUmbrella,
    title: 'Not found',
  },
}

export const DocErrorMessage = ({ capitalize = true }) => {
  if (config.IS_SELF_HOSTED) {
    return (
      <>
        {capitalize ? 'Please' : 'please'} see{' '}
        <A
          rel="noreferrer"
          className="text-ds-blue-default"
          href="https://docs.codecov.io/"
          isExternal={true}
          hook="docs"
        >
          our docs
        </A>{' '}
        for common support.
      </>
    )
  }

  return (
    <>
      {capitalize ? 'Check' : 'check'} on{' '}
      <A
        rel="noreferrer"
        className="text-ds-blue-default"
        href="https://status.codecov.io/"
        isExternal={true}
        hook="status"
      >
        Codecov&apos;s status
      </A>{' '}
      or see{' '}
      <A
        rel="noreferrer"
        className="text-ds-blue-default"
        href="https://docs.codecov.io/"
        isExternal={true}
        hook="docs"
      >
        our docs
      </A>{' '}
      for common support.
    </>
  )
}

DocErrorMessage.propTypes = {
  capitalize: PropTypes.bool,
}

export const NetworkErrorMessage = ({ statusCode }) => {
  if (statusCode === 404) {
    return (
      <p className="my-4 max-w-2xl px-3 text-center sm:px-0">
        To view private repositories ensure you are logged in, you can also{' '}
        <DocErrorMessage capitalize={false} />
      </p>
    )
  }

  return (
    <p className="my-4 max-w-2xl px-3 text-center sm:px-0">
      <DocErrorMessage capitalize={true} />
    </p>
  )
}

NetworkErrorMessage.propTypes = {
  statusCode: PropTypes.number,
}

function ResetHandler({ logoutUser = false, reset, statusCode }) {
  const queryClient = useQueryClient()
  const history = useHistory()
  const location = useLocation()
  const { data: user } = useUser()

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

  const handleSignOut = async () => {
    queryClient.clear()
    reset()
    await fetch(`${config.API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    history.replace('/login')
  }

  const handleReset = () => {
    queryClient.clear()
    history.goBack()
    reset()
  }

  return (
    <div className="my-4 flex items-center gap-2">
      <Button onClick={logoutUser ? handleSignOut : handleReset}>
        {logoutUser ? 'Return to log in' : 'Return to previous page'}
      </Button>
      {/* if the user is logged in, we don't want to show the login button */}
      {statusCode === 404 && !user ? (
        <Button
          variant="primary"
          to={{ pageName: 'login', options: { to: location.pathname } }}
        >
          Log in
        </Button>
      ) : null}
    </div>
  )
}

ResetHandler.propTypes = {
  reset: PropTypes.func,
  logoutUser: PropTypes.bool,
  statusCode: PropTypes.number,
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
      return { hasNetworkError: true, error }
    }

    if (Object.keys(graphQLErrorToUI).includes(error.__typename)) {
      // there are no errors we want to capture for graphql errors
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
        <NetworkErrorMessage statusCode={this.state.error.status} />
        <ResetHandler
          reset={this.resetErrorBoundary}
          statusCode={this.state.error.status}
        />
      </article>
    )
  }

  renderError() {
    const { status, data } = this.state.error
    const { illustration, title, description, showDocs } = errorToUI[status]

    return (
      <article className="mx-auto flex h-full flex-col items-center justify-center">
        <img
          alt="illustration error"
          className={cs(styles.illustrationError, 'mx-auto')}
          src={illustration}
        />
        <h1 className="mt-6 text-2xl">{title}</h1>
        {description ? <p className="mt-2">{description(data)}</p> : null}
        {showDocs ? <NetworkErrorMessage statusCode={status} /> : null}
        <p>
          <strong>Error {status}</strong>
        </p>
        <ResetHandler
          logoutUser={status === 429}
          reset={this.resetErrorBoundary}
          statusCode={status}
        />
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
