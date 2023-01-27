import { isEmpty } from 'lodash'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import { useCommit } from 'services/commit'
import Spinner from 'ui/Spinner'

import CommitPageTabs from '../CommitPageTabs'
import ErroredUploads from '../ErroredUploads'
import { useExtractUploads } from '../UploadsCard/useExtractUploads'

const CommitFileExplorer = lazy(() => import('../subRoute/CommitFileExplorer'))
const CommitFileViewer = lazy(() => import('../subRoute/CommitFileViewer'))
const ImpactedFiles = lazy(() => import('../subRoute/ImpactedFiles'))

const Loader = () => {
  return (
    <div className="flex flex-1 pt-2 justify-center">
      <Spinner size={60} />
    </div>
  )
}

function CommitPageContent() {
  const { provider, owner, repo, commit: commitSHA } = useParams()

  const { data: commitData } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })
  const { erroredUploads } = useExtractUploads({
    uploads: commitData?.commit?.uploads,
  })

  if (!isEmpty(erroredUploads)) {
    return <ErroredUploads erroredUploads={erroredUploads} />
  }

  return (
    <>
      <CommitPageTabs commitSHA={commitSHA} />
      <Suspense fallback={<Loader />}>
        <Switch>
          <SentryRoute
            path={[
              '/:provider/:owner/:repo/commit/:commit/tree/:path+',
              '/:provider/:owner/:repo/commit/:commit/tree/',
            ]}
          >
            <CommitFileExplorer />
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/:repo/commit/:commit/blob/:path+">
            <CommitFileViewer />
          </SentryRoute>
          <SentryRoute path="/:provider/:owner/:repo/commit/:commit" exact>
            <ImpactedFiles commit={commitData?.commit} commitSHA={commitSHA} />
          </SentryRoute>
          <Redirect
            from="/:provider/:owner/:repo/commit/:commit/*"
            to="/:provider/:owner/:repo/commit/:commit"
          />
        </Switch>
      </Suspense>
    </>
  )
}

export default CommitPageContent
