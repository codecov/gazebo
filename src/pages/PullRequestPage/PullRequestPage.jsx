import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import NotFound from 'pages/NotFound'
import { useRepoSettings } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Breadcrumb from 'ui/Breadcrumb'
import Spinner from 'ui/Spinner'

import Header from './Header'
import { usePullPageData } from './hooks'

const PullCoverage = lazy(() => import('./PullCoverage'))

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Spinner />
  </div>
)

function PullRequestPage() {
  const { owner, repo, pullId, provider } = useParams()
  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  const { data: settings } = useRepoSettings()

  const { data: tierData } = useTier({ provider, owner })
  const isTeamPlan =
    multipleTiers &&
    tierData === TierNames.TEAM &&
    settings?.repository?.private

  const { data, isLoading } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
    isTeamPlan,
  })

  if (!isLoading && !data?.pull) {
    return <NotFound />
  }

  return (
    <div className="mx-4 flex flex-col gap-4 md:mx-0">
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
      <Suspense fallback={<Loader />}>
        <PullCoverage />
      </Suspense>
    </div>
  )
}

export default PullRequestPage
