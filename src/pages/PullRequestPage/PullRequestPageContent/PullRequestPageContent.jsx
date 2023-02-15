import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import Spinner from 'ui/Spinner'

import ErrorBanner from './ErrorBanner'
import { ComparisonReturnType } from './ErrorBanner/constants'

import { usePullPageData } from '../hooks'

const FilesChangedTab = lazy(() => import('../subroute/FilesChangedTab'))
const IndirectChangesTab = lazy(() => import('../subroute/IndirectChangesTab'))
const CommitsTab = lazy(() => import('../subroute/CommitsTab'))
const FlagsTab = lazy(() => import('../subroute/FlagsTab'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function PullRequestPageContent() {
  const { owner, repo, pullId, provider } = useParams()
  const { data } = usePullPageData({ provider, owner, repo, pullId })

  const resultType = data?.pull?.compareWithBase?.__typename

  if (resultType !== ComparisonReturnType.SUCCESSFUL_COMPARISON) {
    return <ErrorBanner errorType={resultType} />
  }

  return (
    <Switch>
      <SentryRoute
        path="/:provider/:owner/:repo/pull/:pullId/indirect-changes"
        exact
      >
        <Suspense fallback={<Loader />}>
          <IndirectChangesTab />
        </Suspense>
      </SentryRoute>
      <SentryRoute path="/:provider/:owner/:repo/pull/:pullId/commits" exact>
        <Suspense fallback={<Loader />}>
          <CommitsTab />
        </Suspense>
      </SentryRoute>
      <SentryRoute path="/:provider/:owner/:repo/pull/:pullId/flags" exact>
        <SilentNetworkErrorWrapper>
          <Suspense fallback={<Loader />}>
            <FlagsTab />
          </Suspense>
        </SilentNetworkErrorWrapper>
      </SentryRoute>
      <SentryRoute path="/:provider/:owner/:repo/pull/:pullId" exact>
        <Suspense fallback={<Loader />}>
          <FilesChangedTab />
        </Suspense>
      </SentryRoute>
      <Redirect
        from="/:provider/:owner/:repo/pull/:pullId/*"
        to="/:provider/:owner/:repo/pull/:pullId"
      />
    </Switch>
  )
}

export default PullRequestPageContent
