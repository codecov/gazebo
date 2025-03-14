import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import { Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import SilentNetworkErrorWrapper from 'layouts/shared/SilentNetworkErrorWrapper'
import { useRepoOverview, useRepoRateLimitStatus } from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import ComparisonErrorBanner from 'shared/ComparisonErrorBanner'
import GitHubRateLimitExceededBanner from 'shared/GlobalBanners/GitHubRateLimitExceeded/GitHubRateLimitExceededBanner'
import { ComparisonReturnType, ReportUploadType } from 'shared/utils/comparison'
import Spinner from 'ui/Spinner'

import FirstPullBanner from './FirstPullBanner'
import PullCoverageTabs from './PullCoverageTabs'
import CommitsTab from './routes/CommitsTab'
import ComponentsTab from './routes/ComponentsTab'
import FileExplorer from './routes/FileExplorer'
import FilesChangedTab from './routes/FilesChangedTab'
import FileViewer from './routes/FileViewer'
import FlagsTab from './routes/FlagsTab'
import IndirectChangesTab from './routes/IndirectChangesTab'
import CompareSummary from './Summary'
import CompareSummarySkeleton from './Summary/CompareSummary/CompareSummarySkeleton'

import { PullPageDataQueryOpts } from '../queries/PullPageDataQueryOpts'

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

interface URLParams {
  owner: string
  repo: string
  pullId: string
  provider: string
}

function PullCoverageContent() {
  const { owner, repo, pullId, provider } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })

  const { data } = useSuspenseQueryV5(
    PullPageDataQueryOpts({
      provider,
      owner,
      repo,
      pullId,
      isTeamPlan: (isTeamPlan && overview?.private) ?? false,
    })
  )

  const resultType = data?.pull?.compareWithBase?.__typename

  return (
    <Suspense fallback={<Loader />}>
      {resultType !== ComparisonReturnType.SUCCESSFUL_COMPARISON &&
      resultType !== ComparisonReturnType.FIRST_PULL_REQUEST ? (
        <ComparisonErrorBanner
          errorType={resultType}
          reportType={ReportUploadType.COVERAGE}
        />
      ) : null}
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
  const { owner, repo, pullId, provider } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })
  const { data: rateLimit } = useRepoRateLimitStatus({ provider, owner, repo })

  const { data } = useSuspenseQueryV5(
    PullPageDataQueryOpts({
      provider,
      owner,
      repo,
      pullId,
      isTeamPlan: (isTeamPlan && overview?.private) ?? false,
    })
  )

  return (
    <div className="mx-4 flex flex-col gap-4 md:mx-0">
      <Suspense fallback={<CompareSummarySkeleton />}>
        <CompareSummary />
        {data?.pull?.compareWithBase?.__typename === 'FirstPullRequest' ? (
          <FirstPullBanner />
        ) : null}
      </Suspense>
      <div className="grid grid-cols-1 gap-4 space-y-2 lg:grid-cols-2">
        <article className="col-span-2 flex flex-col gap-3 md:gap-0">
          {rateLimit?.isGithubRateLimited && <GitHubRateLimitExceededBanner />}
          <PullCoverageTabs />
          <PullCoverageContent />
        </article>
      </div>
    </div>
  )
}

export default PullCoverage
