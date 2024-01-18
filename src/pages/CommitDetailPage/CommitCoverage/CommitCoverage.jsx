import isEmpty from 'lodash/isEmpty'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useCommit } from 'services/commit'
import { useCommitErrors } from 'services/commitErrors'
import { useRepoSettingsTeam } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useOwner } from 'services/user'
import { extractUploads } from 'shared/utils/extractUploads'
import Spinner from 'ui/Spinner'

import BotErrorBanner from './BotErrorBanner'
import CommitCoverageSummarySkeleton from './CommitCoverageSummary/CommitCoverageSummarySkeleton'
import CommitCoverageTabs from './CommitCoverageTabs'
import ErroredUploads from './ErroredUploads'
import YamlErrorBanner from './YamlErrorBanner'

const CommitDetailFileExplorer = lazy(() =>
  import('./routes/CommitDetailFileExplorer')
)
const CommitDetailFileViewer = lazy(() =>
  import('./routes/CommitDetailFileViewer')
)
const FilesChangedTab = lazy(() => import('./routes/FilesChangedTab'))
const IndirectChangesTab = lazy(() => import('./routes/IndirectChangesTab'))
const UploadsCard = lazy(() => import('./UploadsCard'))
const CommitCoverageSummary = lazy(() => import('./CommitCoverageSummary'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function CommitErrorBanners() {
  const { owner } = useParams()
  const { data: ownerData } = useOwner({ username: owner })
  const { data: commitErrorData } = useCommitErrors()

  const invalidYaml = commitErrorData?.yamlErrors?.find(
    (err) => err?.errorCode === 'invalid_yaml'
  )

  return (
    <>
      {ownerData?.isCurrentUserPartOfOrg && (
        <BotErrorBanner botErrorsCount={commitErrorData?.botErrors?.length} />
      )}
      {invalidYaml && <YamlErrorBanner />}
    </>
  )
}

function CommitDetailPageContent() {
  const { provider, owner, repo, commit: commitSha } = useParams()
  const { data: tierName } = useTier({ owner, provider })
  const { data: repoData } = useRepoSettingsTeam()

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

  const showIndirectChanges = !(
    repoData?.repository?.private && tierName === TierNames.TEAM
  )

  const hideCommitSummary =
    repoData?.repository?.private && tierName === TierNames.TEAM

  const indirectChangedFilesCount =
    commitData?.commit?.compareWithParent?.indirectChangedFilesCount ?? 0
  const directChangedFilesCount =
    commitData?.commit?.compareWithParent?.directChangedFilesCount ?? 0

  return (
    <div className="flex flex-col gap-4 px-3 sm:px-0">
      {hideCommitSummary ? null : (
        <Suspense fallback={<CommitCoverageSummarySkeleton />}>
          <CommitCoverageSummary />
        </Suspense>
      )}
      {/**we are currently capturing a single error*/}
      <CommitErrorBanners />
      <div className="flex flex-col gap-8 md:flex-row-reverse">
        <aside className="flex flex-1 flex-col gap-6 self-start md:sticky md:top-1.5 md:max-w-sm">
          <Suspense fallback={<Loader />}>
            <UploadsCard />
          </Suspense>
        </aside>
        <article className="flex flex-1 flex-col">
          <div className="@container/commit-detail-page">
            <CommitCoverageTabs
              commitSha={commitSha}
              indirectChangedFilesCount={indirectChangedFilesCount}
              directChangedFilesCount={directChangedFilesCount}
            />
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
                  <CommitDetailFileViewer />
                </SentryRoute>
                <SentryRoute
                  path="/:provider/:owner/:repo/commit/:commit"
                  exact
                >
                  <FilesChangedTab />
                </SentryRoute>
                {showIndirectChanges && (
                  <SentryRoute
                    path="/:provider/:owner/:repo/commit/:commit/indirect-changes"
                    exact
                  >
                    <IndirectChangesTab />
                  </SentryRoute>
                )}
                <Redirect
                  from="/:provider/:owner/:repo/commit/:commit/*"
                  to="/:provider/:owner/:repo/commit/:commit"
                />
              </Switch>
            </Suspense>
          </div>
        </article>
      </div>
    </div>
  )
}

export default CommitDetailPageContent
