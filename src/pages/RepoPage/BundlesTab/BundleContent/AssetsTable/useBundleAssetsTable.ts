import { useMemo } from 'react'

import { useBundleAssets } from 'services/bundleAnalysis'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import { createTimeSeriesQueryVars, Trend } from 'shared/utils/timeseriesCharts'

interface UseBundleAssetsTableArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
}

export function useBundleAssetsTable({
  provider,
  owner,
  repo,
  branch,
  bundle,
}: UseBundleAssetsTableArgs) {
  const { params } = useLocationParams()
  const { data: overview } = useRepoOverview({ provider, owner, repo })

  // @ts-expect-error - useLocationParams needs fixing
  const trend = params?.trend ?? Trend.THREE_MONTHS
  const today = useMemo(() => new Date(), [])

  const queryVars = useMemo(() => {
    const oldestCommit = overview?.oldestCommitAt
      ? new Date(overview.oldestCommitAt)
      : null
    const vars = createTimeSeriesQueryVars({
      today,
      trend,
      oldestCommit,
    })

    return {
      ...vars,
      after: vars.after ?? oldestCommit,
    }
  }, [overview?.oldestCommitAt, today, trend])

  return useBundleAssets({
    provider,
    owner,
    repo,
    branch,
    bundle,
    after: queryVars.after,
    before: queryVars.before,
    interval: queryVars.interval,
    opts: { enabled: branch !== '' && bundle !== '' },
  })
}
