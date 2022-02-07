import { lazy, Suspense } from 'react'
import { useParams, Switch, Route } from 'react-router-dom'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

import { useCommit } from 'services/commit'
import { getProviderCommitURL } from 'shared/utils/provider'

import Spinner from 'ui/Spinner'
import Breadcrumb from 'ui/Breadcrumb'
import A from 'ui/A'

import CoverageReportCard from './CoverageReportCard'
import UploadsCard from './UploadsCard'
import Header from './Header'

const CommitFileView = lazy(() => import('./subroute/CommitFileView.js'))
const CommitsTable = lazy(() => import('./subroute/CommitsTable.js'))
const NotFound = lazy(() => import('pages/NotFound'))

function CommitPage() {
  const { provider, owner, repo, commit, path } = useParams()
  const { data, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commit,
  })

  const loadingState = (
    <div className="flex-1 flex justify-center m-4">
      <Spinner size={60} />
    </div>
  )

  const commitid = commit?.substr(0, 7)
  const diff = data?.impactedFiles?.find((file) => file.headName === path)

  return !isLoading && data ? (
    <div className="flex divide-y gap-4 flex-col px-3 sm:px-0">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: 'commits', text: 'commits' },
          {
            pageName: 'commit',
            options: { commit },
            readOnly: true,
            text: commitid,
          },
        ]}
      />
      <div className="flex flex-col py-4">
        <Header provider={provider} owner={owner} repo={repo} commit={commit} />
        <h1 className="text-lg font-semibold text-ds-gray-octonary mb-1 bt-4">
          {data?.commit?.message}
        </h1>
        <p className="flex items-center text-ds-gray-quinary gap-1">
          {data?.commit?.createdAt
            ? formatDistanceToNow(new Date(data?.commit?.createdAt), {
                addSuffix: true,
              })
            : ''}
          <A
            to={{
              pageName: 'owner',
              options: { owner: data?.commit?.author?.username },
            }}
          >
            {data?.commit?.author?.username}
          </A>
          authored commit
          <A
            variant="code"
            href={getProviderCommitURL({
              provider,
              owner,
              repo,
              commit,
            })}
            hook="provider commit url"
            isExternal={true}
          >
            {commitid}
          </A>
        </p>
      </div>
      <div className="flex pt-8 flex-col gap-8 md:flex-row">
        <aside className="flex gap-6 md:max-w-sm flex-col">
          <CoverageReportCard
            provider={provider}
            repo={repo}
            owner={owner}
            data={data?.commit}
          />
          <UploadsCard />
        </aside>
        <article className="flex flex-col flex-1 gap-4">
          <Switch>
            <Route path="/:provider/:owner/:repo/commit/:commit/:path+" exact>
              <Suspense fallback={loadingState}>
                <CommitFileView diff={diff} />
              </Suspense>
            </Route>
            <Route path="/:provider/:owner/:repo/commit/:commit">
              <h2 className="text-base font-semibold">Impacted files</h2>
              <Suspense fallback={loadingState}>
                <CommitsTable
                  commit={commit}
                  state={data?.commit?.state}
                  data={data?.commit?.compareWithParent?.impactedFiles}
                />
              </Suspense>
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
