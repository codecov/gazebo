import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { ComparisonReturnType } from 'shared/utils/comparison'
import Spinner from 'ui/Spinner'

import ErrorBanner from './ErrorBanner'

import { usePullPageData } from '../hooks'

const FilesChangedTab = lazy(() => import('../subroute/FilesChangedTab'))
const IndirectChangesTab = lazy(() => import('../subroute/IndirectChangesTab'))
const CommitsTab = lazy(() => import('../subroute/CommitsTab'))
const FlagsTab = lazy(() => import('../subroute/FlagsTab'))
const FileExplorer = lazy(() => import('../subroute/FileExplorer'))
const FileViewer = lazy(() => import('../subroute/FileViewer'))
const Components = lazy(() => import('../subroute/ComponentsTab'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function PullRequestPageContent() {
  const { owner, repo, pullId, provider } = useParams()
  const { data } = usePullPageData({ provider, owner, repo, pullId })

  const resultType = data?.pull?.compareWithBase?.__typename

  if (
    resultType !== ComparisonReturnType.SUCCESSFUL_COMPARISON &&
    resultType !== ComparisonReturnType.FIRST_PULL_REQUEST
  ) {
    return <ErrorBanner errorType={resultType} />
  }

  return (
    <Switch>
      <SentryRoute
        path={[
          '/:provider/:owner/:repo/pull/:pullId/tree/:path+',
          '/:provider/:owner/:repo/pull/:pullId/tree/',
        ]}
      >
        <Suspense fallback={<Loader />}>
          <FileExplorer />
        </Suspense>
      </SentryRoute>
      <SentryRoute path={['/:provider/:owner/:repo/pull/:pullId/blob/:path+']}>
        <Suspense fallback={<Loader />}>
          <FileViewer />
        </Suspense>
      </SentryRoute>
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
      <SentryRoute path="/:provider/:owner/:repo/pull/:pullId/components" exact>
        <SilentNetworkErrorWrapper>
          <Suspense fallback={<Loader />}>
            <Components />
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
