import { useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCommitErrors } from 'services/commitErrors'
import { useOwner } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import BotErrorBanner from './BotErrorBanner'
import CommitDetailSummarySkeleton from './CommitDetailSummary/CommitDetailSummarySkeleton'
import Header from './Header'
import { useCommitPageData } from './hooks'
import YamlErrorBanner from './YamlErrorBanner'

const CommitDetailPageContent = lazy(() => import('./CommitDetailPageContent'))
const CommitDetailSummary = lazy(() => import('./CommitDetailSummary'))
const UploadsCard = lazy(() => import('./UploadsCard'))

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
      <Suspense fallback={<CommitDetailSummarySkeleton />}>
        <CommitDetailSummary />
      </Suspense>
      {/**we are currently capturing a single error*/}
      <CommitErrorBanners />
      <div className="flex flex-col gap-8 md:flex-row-reverse">
        <aside className="flex flex-1 flex-col gap-6 self-start md:sticky md:top-1.5 md:max-w-sm">
          <Suspense fallback={<Loader />}>
            <UploadsCard />
          </Suspense>
        </aside>
        <article className="flex flex-1 flex-col">
          <Suspense fallback={<Loader />}>
            <CommitDetailPageContent />
          </Suspense>
        </article>
      </div>
    </div>
  )
}

export default CommitDetailPage
