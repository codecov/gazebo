import { useSuspenseQuery as useSuspenseQueryV5 } from '@tanstack/react-queryV5'
import isEmpty from 'lodash/isEmpty'
import { Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useCommit } from 'services/commit/useCommit'
import { useCommitErrors } from 'services/commitErrors/useCommitErrors'
import { useRepoOverview, useRepoRateLimitStatus } from 'services/repo'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import { useOwner } from 'services/user'
import ComparisonErrorBanner from 'shared/ComparisonErrorBanner'
import GitHubRateLimitExceededBanner from 'shared/GlobalBanners/GitHubRateLimitExceeded/GitHubRateLimitExceededBanner'
import { ReportUploadType } from 'shared/utils/comparison'
import { extractUploads } from 'shared/utils/extractUploads'
import Spinner from 'ui/Spinner'

import BotErrorBanner from './BotErrorBanner'
import CommitCoverageSummary from './CommitCoverageSummary'
import CommitCoverageSummarySkeleton from './CommitCoverageSummary/CommitCoverageSummarySkeleton'
import CommitCoverageTabs from './CommitCoverageTabs'
import ErroredUploads from './ErroredUploads'
import FirstPullBanner from './FirstPullBanner'
import CommitDetailFileExplorer from './routes/CommitDetailFileExplorer'
import CommitDetailFileViewer from './routes/CommitDetailFileViewer'
import FilesChangedTab from './routes/FilesChangedTab'
import IndirectChangesTab from './routes/IndirectChangesTab'
import UploadsCard from './UploadsCard'
import YamlErrorBanner from './YamlErrorBanner'

import { CommitPageDataQueryOpts } from '../queries/CommitPageDataQueryOpts'

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function CommitRoutes() {
  const { provider, owner, repo, commit: commitSha } = useParams()
  const { data: isTeamPlan } = useIsTeamPlan({ owner, provider })
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { data: commitPageData } = useSuspenseQueryV5(
    CommitPageDataQueryOpts({
      provider,
      owner,
      repo,
      commitId: commitSha,
    })
  )

  const compareTypeName = commitPageData?.commit?.compareWithParent?.__typename
  const ErrorBannerComponent = (
    <ComparisonErrorBanner
      errorType={compareTypeName}
      reportType={ReportUploadType.COVERAGE}
    />
  )
  if (
    compareTypeName !== 'Comparison' &&
    compareTypeName !== 'FirstPullRequest' &&
    compareTypeName !== 'MissingBaseCommit'
  ) {
    return ErrorBannerComponent
  }

  // we still want to show file explorer when missing base commit since the file structure
  // is still useful info to the user
  const isMissingBaseCommit = compareTypeName === 'MissingBaseCommit'

  const showIndirectChanges = !(overview.private && isTeamPlan)

  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <SentryRoute
          path={[
            '/:provider/:owner/:repo/commit/:commit/tree/:path+',
            '/:provider/:owner/:repo/commit/:commit/tree/',
          ]}
        >
          <CommitDetailFileExplorer />
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/commit/:commit/blob/:path+">
          {isMissingBaseCommit ? (
            ErrorBannerComponent
          ) : (
            <CommitDetailFileViewer />
          )}
        </SentryRoute>
        <SentryRoute path="/:provider/:owner/:repo/commit/:commit" exact>
          {isMissingBaseCommit ? ErrorBannerComponent : <FilesChangedTab />}
        </SentryRoute>
        {showIndirectChanges && (
          <SentryRoute
            path="/:provider/:owner/:repo/commit/:commit/indirect-changes"
            exact
          >
            {isMissingBaseCommit ? (
              ErrorBannerComponent
            ) : (
              <IndirectChangesTab />
            )}
          </SentryRoute>
        )}
        <Redirect
          from="/:provider/:owner/:repo/commit/:commit/*"
          to="/:provider/:owner/:repo/commit/:commit"
        />
      </Switch>
    </Suspense>
  )
}

function CommitErrorBanners() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const { data } = useCommitErrors()

  const invalidYaml = data?.yamlErrors?.find(
    (err) => err?.errorCode === 'invalid_yaml'
  )

  return (
    <>
      {ownerData?.isCurrentUserPartOfOrg && (
        <BotErrorBanner botErrorsCount={data?.botErrors?.length} />
      )}
      {invalidYaml && <YamlErrorBanner shouldLinkToModal={true} />}
    </>
  )
}

function CommitCoverageRoutes() {
  const { provider, owner, repo, commit: commitSha } = useParams()

  const { data: commitData } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSha,
  })

  const { erroredUploads } = extractUploads({
    unfilteredUploads: commitData?.commit?.uploads,
  })

  if (!isEmpty(erroredUploads)) {
    return <ErroredUploads erroredUploads={erroredUploads} />
  }

  const indirectChangedFilesCount =
    commitData?.commit?.compareWithParent?.indirectChangedFilesCount ?? 0
  const directChangedFilesCount =
    commitData?.commit?.compareWithParent?.directChangedFilesCount ?? 0

  return (
    <div className="@container/commit-detail-page">
      <CommitCoverageTabs
        commitSha={commitSha}
        indirectChangedFilesCount={indirectChangedFilesCount}
        directChangedFilesCount={directChangedFilesCount}
      />
      <CommitRoutes />
    </div>
  )
}

function CommitCoverage() {
  const { provider, owner, repo, commit: commitSha } = useParams()
  const { data: isTeamPlan } = useIsTeamPlan({ owner, provider })
  const { data: overview } = useRepoOverview({ provider, owner, repo })
  const { data: rateLimit } = useRepoRateLimitStatus({ provider, owner, repo })
  const { data: commitPageData } = useSuspenseQueryV5(
    CommitPageDataQueryOpts({
      provider,
      owner,
      repo,
      commitId: commitSha,
    })
  )

  const showCommitSummary = !(overview.private && isTeamPlan)
  const showFirstPullBanner =
    commitPageData?.commit?.compareWithParent?.__typename === 'FirstPullRequest'
  return (
    <div className="flex flex-col gap-4 px-3 sm:px-0">
      {showCommitSummary ? (
        <Suspense fallback={<CommitCoverageSummarySkeleton />}>
          <CommitCoverageSummary />
        </Suspense>
      ) : null}
      {showFirstPullBanner ? <FirstPullBanner /> : null}
      {/**we are currently capturing a single error*/}
      <CommitErrorBanners />
      {rateLimit?.isGithubRateLimited && <GitHubRateLimitExceededBanner />}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
        <article className="flex flex-1 flex-col">
          <CommitCoverageRoutes />
        </article>
        <aside className="flex w-full flex-1 flex-col gap-6 self-start py-3 lg:sticky lg:top-16 lg:max-w-sm">
          <Suspense fallback={<Loader />}>
            <UploadsCard />
          </Suspense>
        </aside>
      </div>
    </div>
  )
}

export default CommitCoverage
