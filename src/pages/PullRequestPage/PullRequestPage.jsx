import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import Header from './Header'
import { usePullPageData } from './hooks'
import CompareSummarySkeleton from './Summary/CompareSummarySkeleton'

const CompareSummary = lazy(() => import('./Summary'))
const PullRequestPageTabs = lazy(() => import('./PullRequestPageTabs'))
const PullRequestPageContent = lazy(() => import('./PullRequestPageContent'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function PullRequestPage() {
  const { owner, repo, pullId, provider } = useParams()
  const { data, isLoading } = usePullPageData({ provider, owner, repo, pullId })

  if (!isLoading && (!data?.hasAccess || !data?.pull)) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-4 mx-4 md:mx-0">
      <Breadcrumb
        paths={[
          { pageName: 'owner', text: owner },
          { pageName: 'repo', text: repo },
          { pageName: 'pulls', text: 'Pulls' },
          {
            pageName: 'pullDetail',
            options: { pullId },
            readOnly: true,
            text: pullId,
          },
        ]}
      />
      <Header />
      <Suspense fallback={<CompareSummarySkeleton />}>
        <CompareSummary />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 space-y-2">
          <article className="col-span-2 flex flex-col gap-3 md:gap-0">
            <PullRequestPageTabs />
            <Suspense fallback={<Loader />}>
              <PullRequestPageContent />
            </Suspense>
          </article>
        </div>
      </Suspense>
    </div>
  )
}

export default PullRequestPage
