import isEmpty from 'lodash/isEmpty'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useCommit } from 'services/commit'
import { TierNames, useTier } from 'services/tier'
import { extractUploads } from 'shared/utils/extractUploads'
import Spinner from 'ui/Spinner'

import CommitPageTabs from '../CommitDetailPageTabs'
import ErroredUploads from '../ErroredUploads'

const CommitDetailFileExplorer = lazy(() =>
  import('../subRoute/CommitDetailFileExplorer')
)
const CommitDetailFileViewer = lazy(() =>
  import('../subRoute/CommitDetailFileViewer')
)
const FilesChangedTab = lazy(() => import('../subRoute/FilesChangedTab'))
const IndirectChangesTab = lazy(() => import('../subRoute/IndirectChangesTab'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function CommitDetailPageContent() {
  const { provider, owner, repo, commit: commitSha } = useParams()
  const { data: tierName } = useTier({ owner, provider })

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
    <>
      <CommitPageTabs
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
          <SentryRoute path="/:provider/:owner/:repo/commit/:commit" exact>
            <FilesChangedTab />
          </SentryRoute>
          {tierName !== TierNames.TEAM && (
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
    </>
  )
}

export default CommitDetailPageContent
