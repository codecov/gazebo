import { useParams } from 'react-router-dom'

import { BundleTrendChart } from 'ui/BundleTrendChart'

import { TrendDropdown } from './TrendDropdown'
import { useBundleChartData } from './useBundleChartData'

const Placeholder = () => (
  <div
    data-testid="bundle-chart-placeholder"
    className="h-[23rem] animate-pulse rounded bg-ds-gray-tertiary"
  />
)

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
}

export function BundleChart() {
  const { provider, owner, repo, branch, bundle } = useParams<URLParams>()
  const { data, maxY, multiplier, isLoading } = useBundleChartData({
    provider,
    owner,
    repo,
    branch,
    bundle,
  })

  return (
    <div className="pb-4 pt-6">
      <TrendDropdown />
      {isLoading ? (
        <Placeholder />
      ) : (
        <BundleTrendChart
          title="Bundle Size"
          desc="The size of the bundle over time"
          data={{
            measurements: data,
            maxY,
            multiplier,
          }}
        />
      )}
    </div>
  )
}
