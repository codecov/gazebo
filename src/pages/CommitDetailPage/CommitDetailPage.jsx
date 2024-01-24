import { useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import Header from './Header'
import { useCommitPageData } from './hooks'

const CommitCoverage = lazy(() => import('./CommitCoverage'))

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner size={60} />
  </div>
)

function CommitDetailPage() {
  const { provider, owner, repo, commit: commitSha } = useParams()
  const shortSHA = commitSha?.slice(0, 7)

  // reset cache when user navigates to the commit detail page
  const queryClient = useQueryClient()
  queryClient.setQueryData(['IgnoredUploadIds'], [])

  const { data: commitPageData, isLoading } = useCommitPageData({
    provider,
    owner,
    repo,
    commitId: commitSha,
  })

  if (
    !isLoading &&
    !commitPageData?.commit &&
    !commitPageData?.isCurrentUserPartOfOrg
  ) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4 px-3 sm:px-0">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: 'commits', text: 'commits' },
          {
            pageName: 'commit',
            options: { commitSha },
            readOnly: true,
            text: shortSHA,
          },
        ]}
      />
      <Header />
      <Suspense fallback={<Loader />}>
        <CommitCoverage />
      </Suspense>
    </div>
  )
}

export default CommitDetailPage
