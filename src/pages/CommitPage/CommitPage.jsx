import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useCommitErrors } from 'services/commitErrors'
import { useOwner } from 'services/user'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import BotErrorBanner from './BotErrorBanner'
import CommitSummarySkeleton from './CommitSummary/CommitSummarySkeleton'
import Header from './Header'
import { useCommitPageData } from './hooks'
import YamlErrorBanner from './YamlErrorBanner'

const CommitPageContent = lazy(() => import('./CommitPageContent'))
const CommitSummary = lazy(() => import('./CommitSummary'))
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

  const { data: commitPageData, isLoading } = useCommitPageData({
    provider,
    owner,
    repo,
    commitId: commitSHA,
  })

  if (
    !isLoading &&
    !commitPageData?.commit &&
    !commitPageData?.isCurrentUserPartOfOrg
  ) {
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
      <Suspense fallback={<CommitSummarySkeleton />}>
        <CommitSummary />
      </Suspense>
      {/**we are currently capturing a single error*/}
      <CommitErrorBanners />
      <div className="flex flex-col gap-8 md:flex-row-reverse">
        <aside className="flex flex-1 gap-6 md:max-w-sm flex-col self-start sticky top-1.5">
          <Suspense fallback={<Loader />}>
            <UploadsCard />
          </Suspense>
        </aside>
        <article className="flex flex-1 flex-col">
          <Suspense fallback={<Loader />}>
            <CommitPageContent />
          </Suspense>
        </article>
      </div>
    </div>
  )
}

export default CommitPage
