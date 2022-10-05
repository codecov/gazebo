import isEmpty from 'lodash/isEmpty'
import { lazy, Suspense } from 'react'
import { Route, Switch, useParams } from 'react-router-dom'

import { useCommit } from 'services/commit'
import { useCommitErrors } from 'services/commitErrors'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import BotErrorBanner from './BotErrorBanner'
import ErroredUploads from './ErroredUploads'
import Header from './Header'
import CommitDetailsSummary from './Summary'
import UploadsCard from './UploadsCard'
import { useExtractUploads } from './UploadsCard/useExtractUploads'
import YamlErrorBanner from './YamlErrorBanner'

const CommitFileView = lazy(() => import('./subroute/CommitFileView'))
const CommitsTable = lazy(() => import('./subroute/CommitsTable'))
const NotFound = lazy(() => import('pages/NotFound'))

// eslint-disable-next-line complexity
function CommitPage() {
  const { provider, owner, repo, commit: commitSHA, path } = useParams()
  const { data, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSHA,
  })
  const commit = data?.commit
  const { erroredUploads } = useExtractUploads({ uploads: commit?.uploads })

  const {
    data: { yamlErrors, botErrors },
  } = useCommitErrors()
  const invalidYaml = yamlErrors?.find(
    (err) => err?.errorCode === 'invalid_yaml'
  )

  const loadingState = (
    <div className="flex-1 flex justify-center m-4">
      <Spinner size={60} />
    </div>
  )

  const shortSHA = commitSHA?.slice(0, 7)
  const diff = commit?.compareWithParent?.impactedFiles?.find(
    (file) => file.headName === path
  )

  return !isLoading && commit ? (
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
      {botErrors?.length > 0 && <BotErrorBanner />}
      {invalidYaml && <YamlErrorBanner />}
      <div className="flex pt-6 flex-col gap-8 md:flex-row-reverse">
        <aside className="flex flex-1 gap-6 md:max-w-sm flex-col self-start sticky top-1.5">
          <UploadsCard />
        </aside>
        <article className="flex flex-1 flex-col gap-4">
          <Switch>
            <Route path="/:provider/:owner/:repo/commit/:commit/:path+" exact>
              <Suspense fallback={loadingState}>
                <CommitFileView diff={diff} />
              </Suspense>
            </Route>
            <Route path="/:provider/:owner/:repo/commit/:commit">
              <h2 className="text-base font-semibold">Impacted files</h2>
              {!isEmpty(erroredUploads) ? (
                <ErroredUploads erroredUploads={erroredUploads} />
              ) : (
                <Suspense fallback={loadingState}>
                  <CommitsTable
                    commit={commitSHA}
                    state={commit?.state}
                    data={commit?.compareWithParent?.impactedFiles}
                  />
                </Suspense>
              )}
            </Route>
          </Switch>
        </article>
      </div>
    </div>
  ) : (
    <Suspense fallback={loadingState}>
      <NotFound />
    </Suspense>
  )
}

export default CommitPage
