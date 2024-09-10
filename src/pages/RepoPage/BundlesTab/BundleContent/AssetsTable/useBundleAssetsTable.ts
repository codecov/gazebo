import { useMemo } from 'react'

import { OrderingDirection } from 'types'

import { useBundleAssets } from 'services/bundleAnalysis/useBundleAssets'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import { createTimeSeriesQueryVars, Trend } from 'shared/utils/timeseriesCharts'

interface UseBundleAssetsTableArgs {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
  orderingDirection?: OrderingDirection
  ordering?: 'NAME' | 'SIZE' | 'TYPE'
}

export function useBundleAssetsTable({
  provider,
  owner,
  repo,
  branch,
  bundle,
  orderingDirection,
  ordering,
}: UseBundleAssetsTableArgs) {
  const { params } = useLocationParams()
  const { data: overview } = useRepoOverview({ provider, owner, repo })

  // @ts-expect-error - useLocationParams needs fixing
  const typeFilters = params?.types ?? []
  // @ts-expect-error - useLocationParams needs fixing
  const loadTypes = params?.loading ?? []

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
    dateAfter: queryVars.after,
    dateBefore: queryVars.before,
    interval: queryVars.interval,
    ordering,
    orderingDirection,
    filters: {
      reportGroups: typeFilters,
      loadTypes: loadTypes,
    },
    opts: { enabled: branch !== '' && bundle !== '' },
  })
}
