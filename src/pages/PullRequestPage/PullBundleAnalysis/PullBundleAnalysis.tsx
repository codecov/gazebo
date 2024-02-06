import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { useRepoSettings } from 'services/repo'
import { TierNames, useTier } from 'services/tier'
import { useFlags } from 'shared/featureFlags'
import Spinner from 'ui/Spinner'

import BundleMessage from './BundleMessage'

import { usePullPageData } from '../hooks'

const PullBundleAnalysisTable = lazy(() => import('./PullBundleAnalysisTable'))

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

const Loader = () => (
  <div className="flex flex-1 justify-center">
    <Spinner />
  </div>
)

const PullBundleAnalysis: React.FC = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data: settings } = useRepoSettings()
  const { data: tierData } = useTier({ provider, owner })

  const { multipleTiers } = useFlags({
    multipleTiers: false,
  })

  const isTeamPlan =
    multipleTiers &&
    tierData === TierNames.TEAM &&
    settings?.repository?.private

  const { data } = usePullPageData({
    provider,
    owner,
    repo,
    pullId,
    isTeamPlan,
  })

  if (data?.coverageEnabled && data?.bundleAnalysisEnabled) {
    return (
      <Suspense fallback={<Loader />}>
        <PullBundleAnalysisTable />
      </Suspense>
    )
  }

  return (
    <>
      <p className="flex w-full items-center gap-2 bg-ds-gray-primary px-2 py-4">
        <BundleMessage />
      </p>
      <Suspense fallback={<Loader />}>
        <PullBundleAnalysisTable />
      </Suspense>
    </>
  )
}

export default PullBundleAnalysis
