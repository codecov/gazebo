import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router-dom'
import cs from 'classnames'
import PropTypes from 'prop-types'
import config from 'config'
import A from 'ui/A'
import Button from 'ui/Button'
import openUmbrella from './assets/error-open-umbrella.svg'
import upsideDownUmbrella from './assets/error-upsidedown-umbrella.svg'
import styles from './NetworkErrorBoundary.module.css'
import {
  sendGraphQLErrorMetrics,
  sendNetworkErrorMetrics,
} from './networkErrorMetrics'
import { useUserAccessGate } from 'layouts/BaseLayout/hooks/useUserAccessGate'
// import { useImpersonate } from '

import GlobalBanners from 'shared/GlobalBanners'
import GlobalTopBanners from 'shared/GlobalTopBanners'

const errorToUI = {
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

export const NetworkErrorMessage = () => {
  if (config.IS_SELF_HOSTED) {
    return (
      <p className="my-4 px-3 sm:px-0">
        Please see{' '}
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
      </p>
    )
  }

  return (
    <p className="my-4 px-3 sm:px-0">
      Check on{' '}
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
    </p>
  )
}

function ResetHandler({ logoutUser = false, reset }) {
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
    <div className="my-4">
      <Button onClick={logoutUser ? handleSignOut : handleReset}>
        {logoutUser ? 'Return to login' : 'Return to previous page'}
      </Button>
    </div>
  )
}

ResetHandler.propTypes = {
  reset: PropTypes.func,
  logoutUser: PropTypes.bool,
}

const NetworkErrorBoundary = ({ children }) => {
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const [hasGraphqlError, setHasGraphqlError] = useState(false)
  const [error, setError] = useState(null)

  const { isFullExperience, showDefaultOrgSelector } = useUserAccessGate()
  // const { isImpersonating } = useImpersonate()
  const isImpersonating = true

  const resetErrorBoundary = () => {
    setHasNetworkError(false)
    setHasGraphqlError(false)
    setError(null)
  }

  useEffect(() => {
    // const errorHandler = (error) => {
    //   if (Object.keys(errorToUI).includes(String(error.status))) {
    //     sendNetworkErrorMetrics(error.status)
    //     setHasNetworkError(true)
    //     setError(error)
    //   } else if (Object.keys(graphQLErrorToUI).includes(error.__typename)) {
    //     sendGraphQLErrorMetrics(error.__typename)
    //     setHasGraphqlError(true)
    //     setError(error)
    //   }
    // }

    // Add your error handling logic here to trigger errorHandler
  }, [])

  const renderGraphQLError = () => {
    const { illustration, title } = graphQLErrorToUI[error.__typename]

    return (
      <>
        {isFullExperience || isImpersonating ? (
          <>
            <GlobalTopBanners />
            <Header />
          </>
        ) : (
          <Suspense fallback={null}>
            {showDefaultOrgSelector && <InstallationHelpBanner />}
          </Suspense>
        )}
        <article className="mx-auto flex h-full flex-col items-center justify-center">
          <img
            alt="illustration error"
            className={cs(styles.illustrationError, 'mx-auto')}
            src={illustration}
          />
          <h1 className="mt-6 text-2xl">{title}</h1>
          <NetworkErrorMessage />
          <ResetHandler reset={resetErrorBoundary} />
        </article>
      </>
    )
  }

  const renderError = () => {
    const { status, data } = error
    const { illustration, title, description, showDocs } = errorToUI[status]

    return (
      <>
        {isFullExperience || isImpersonating ? (
          <>
            <GlobalTopBanners />
            <Header />
          </>
        ) : (
          <Suspense fallback={null}>
            {showDefaultOrgSelector && <InstallationHelpBanner />}
          </Suspense>
        )}
        <article className="mx-auto flex h-full flex-col items-center justify-center">
          <img
            alt="illustration error"
            className={cs(styles.illustrationError, 'mx-auto')}
            src={illustration}
          />
          <h1 className="mt-6 text-2xl">{title}</h1>
          {description ? <p className="mt-2">{description(data)}</p> : null}
          {showDocs ? <NetworkErrorMessage /> : null}
          <p>
            <strong>Error {status}</strong>
          </p>
          <ResetHandler
            logoutUser={status === 429}
            reset={resetErrorBoundary}
          />
        </article>
      </>
    )
  }

  if (hasNetworkError) return renderError()
  if (hasGraphqlError) return renderGraphQLError()
  return <>{children}</>
}

NetworkErrorBoundary.propTypes = {
  children: PropTypes.node,
}

export default NetworkErrorBoundary
