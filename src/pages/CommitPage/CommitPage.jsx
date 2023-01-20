import { isEmpty } from 'lodash'
import { lazy, Suspense } from 'react'
import { Redirect, Switch, useParams } from 'react-router-dom'

import { SentryRoute } from 'sentry'

import NotFound from 'pages/NotFound'
import { useCommit } from 'services/commit'
import { useCommitErrors } from 'services/commitErrors'
import { useOwner } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import BotErrorBanner from './BotErrorBanner'
import CommitPageTabs from './CommitPageTabs'
import ErroredUploads from './ErroredUploads'
import Header from './Header'
import CommitDetailsSummary from './Summary'
import { useExtractUploads } from './UploadsCard/useExtractUploads'
import YamlErrorBanner from './YamlErrorBanner'

const CommitFileExplorer = lazy(() => import('./subroute/CommitFileExplorer'))
const CommitFileViewer = lazy(() => import('./subroute/CommitFileViewer'))
const ImpactedFiles = lazy(() => import('./subroute/ImpactedFiles'))
const UploadsCard = lazy(() => import('./UploadsCard'))

const Loader = () => {
  return (
    <div className="flex-1 flex justify-center">
      <Spinner size={60} />
    </div>
  )
}

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

function CommitPage() {
  const { provider, owner, repo, commit: commitSHA } = useParams()
  const shortSHA = commitSHA?.slice(0, 7)

  const { data, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })

  const commit = data?.commit

  const { erroredUploads } = useExtractUploads({ uploads: commit?.uploads })

  if (!commit && !isLoading) {
    return <NotFound />
  }

  return (
    <div className="flex gap-4 flex-col px-3 sm:px-0">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: 'commits', text: 'commits' },
          {
            pageName: 'commit',
            options: { commitSHA },
            readOnly: true,
            text: shortSHA,
          },
        ]}
      />
      <Header />
      <CommitDetailsSummary />
      {/**we are currently capturing a single error*/}
      <CommitErrorBanners />
      <div className="flex flex-col gap-8 md:flex-row-reverse">
        <aside className="flex flex-1 gap-6 md:max-w-sm flex-col self-start sticky top-1.5">
          <Suspense fallback={<Loader />}>
            <UploadsCard />
          </Suspense>
        </aside>
        <article className="flex flex-1 flex-col">
          {!isEmpty(erroredUploads) ? (
            <ErroredUploads erroredUploads={erroredUploads} />
          ) : (
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
                  <SentryRoute
                    path="/:provider/:owner/:repo/commit/:commit"
                    exact
                  >
                    <ImpactedFiles commit={commit} commitSHA={commitSHA} />
                  </SentryRoute>
                  <Redirect
                    from="/:provider/:owner/:repo/commit/:commit/*"
                    to="/:provider/:owner/:repo/commit/:commit"
                  />
                </Switch>
              </Suspense>
            </>
          )}
        </article>
      </div>
    </div>
  )
}

export default CommitPage
