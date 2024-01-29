import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { useRepoSettings } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import { ComparisonReturnType } from 'shared/utils/comparison'
import Spinner from 'ui/Spinner'

import ErrorBanner from './ErrorBanner'
import PullCoverageTabs from './PullCoverageTabs'
import CompareSummarySkeleton from './Summary/CompareSummary/CompareSummarySkeleton'

import { usePullPageData } from '../hooks'

const CompareSummary = lazy(() => import('./Summary'))
const FirstPullBanner = lazy(() => import('../FirstPullBanner'))

const CommitsTab = lazy(() => import('./routes/CommitsTab'))
const ComponentsTab = lazy(() => import('./routes/ComponentsTab'))
const FlagsTab = lazy(() => import('./routes/FlagsTab'))
const FilesChangedTab = lazy(() => import('./routes/FilesChangedTab'))
const FileExplorer = lazy(() => import('./routes/FileExplorer'))
const FileViewer = lazy(() => import('./routes/FileViewer'))
const IndirectChangesTab = lazy(() => import('./routes/IndirectChangesTab'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function PullCoverageContent() {
  const { owner, repo, pullId, provider } = useParams()
  const { data: settings } = useRepoSettings()
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })
  const { data: tierData } = useTier({ provider, owner })
  const isTeamPlan =
    multipleTiers &&
    tierData === TierNames.TEAM &&
    settings?.repository?.private

  const { data } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
    isTeamPlan,
  })

  const resultType = data?.pull?.compareWithBase?.__typename

  if (
    resultType !== ComparisonReturnType.SUCCESSFUL_COMPARISON &&
    resultType !== ComparisonReturnType.FIRST_PULL_REQUEST
  ) {
    return <ErrorBanner errorType={resultType} />
  }

  return (
    <Suspense fallback={<Loader />}>
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
        <SentryRoute
          path={['/:provider/:owner/:repo/pull/:pullId/blob/:path+']}
        >
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
        <SentryRoute
          path="/:provider/:owner/:repo/pull/:pullId/components"
          exact
        >
          <SilentNetworkErrorWrapper>
            <Suspense fallback={<Loader />}>
              <ComponentsTab />
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
    </Suspense>
  )
}

function PullCoverage() {
  return (
    <div className="mx-4 flex flex-col gap-4 md:mx-0">
      <Suspense fallback={<CompareSummarySkeleton />}>
        <CompareSummary />
        <FirstPullBanner />
      </Suspense>
      <div className="grid grid-cols-1 gap-4 space-y-2 lg:grid-cols-2">
        <article className="col-span-2 flex flex-col gap-3 md:gap-0">
          <PullCoverageTabs />
          <PullCoverageContent />
        </article>
      </div>
    </div>
  )
}

export default PullCoverage
