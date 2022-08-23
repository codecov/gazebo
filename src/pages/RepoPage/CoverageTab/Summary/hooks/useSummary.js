import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useLegacyRepoCoverage } from 'services/charts'
import { useLocationParams } from 'services/navigation'
import { useRepoCoverage, useRepoOverview } from 'services/repo'
import { sparklineQuery, Trend } from 'shared/utils/legacyCharts'

import { useBranchSelector } from './useBranchSelector'

function getTrendEnum(trend) {
  for (let key in Trend) {
    if (Trend[key] === trend) {
      return Trend[key]
    }
  }

  return Trend.LAST_YEAR
}

function useSparkline({ branch, options }) {
  const { params } = useLocationParams()
  const { repo, owner, provider } = useParams()

  const today = useMemo(() => new Date(), [])
  const body = useMemo(
    () =>
      sparklineQuery({
        branch,
        repo,
        trend: getTrendEnum(params?.trend) || Trend.ALL_TIME,
        today,
      }),
    [repo, branch, today, params?.trend]
  )
  const {
    data: { coverage },
    isSuccess,
  } = useLegacyRepoCoverage({
    provider,
    owner,
    branch,
    trend: params.trend,
    body,
    opts: options,
  })
  const coverageChange = useMemo(
    () => coverage[coverage?.length - 1]?.coverage - coverage[0]?.coverage,
    [coverage]
  )

  return {
    coverageChange,
    legacyApiIsSuccess: isSuccess,
    coverage,
  }
}

export function useSummary() {
  const { repo, owner, provider } = useParams()
  const { data: overview, isLoading } = useRepoOverview({
    provider,
    repo,
    owner,
  })
  const { selection, branchSelectorProps } = useBranchSelector(
    overview?.branches,
    overview?.defaultBranch
  )
  const { data, isLoading: isLoadingRepoCoverage } = useRepoCoverage({
    provider,
    repo,
    owner,
    branch: selection?.name,
    options: { enabled: !!selection?.name },
  })
  const { coverageChange, legacyApiIsSuccess, coverage } = useSparkline({
    branch: selection?.name,
    options: { enabled: !!selection?.name },
  })

  return {
    isLoading: isLoading && isLoadingRepoCoverage,
    data,
    branchSelectorProps,
    currentBranchSelected: selection,
    defaultBranch: overview?.defaultBranch,
    privateRepo: overview?.private,
    coverage,
    coverageChange,
    legacyApiIsSuccess,
  }
}
