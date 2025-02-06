import {
  keepPreviousData,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { BranchCoverageMeasurementsQueryOpts } from 'services/charts/BranchCoverageMeasurementsQueryOpts'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import {
  createTimeSeriesQueryVars,
  getTrendEnum,
  Trend,
  Trends,
} from 'shared/utils/timeseriesCharts'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface UseRepoCoverageTimeseriesArgs {
  branch: string
  options?: {
    enabled?: boolean
    placeholderData?: typeof keepPreviousData
  }
}

export function useRepoCoverageTimeseries({
  branch,
  options = {},
}: UseRepoCoverageTimeseriesArgs) {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data: overview } = useRepoOverview({ provider, owner, repo })

  const {
    params,
  }: {
    params: { trend?: Trends }
  } = useLocationParams({ trend: Trend.THREE_MONTHS })

  const today = useMemo(() => new Date(), [])

  const queryVars = useMemo(() => {
    const trend = getTrendEnum(params?.trend ?? Trend.THREE_MONTHS)
    const oldestCommit = overview?.oldestCommitAt
      ? new Date(overview?.oldestCommitAt)
      : null
    return createTimeSeriesQueryVars({ trend, oldestCommit, today })
  }, [overview?.oldestCommitAt, params?.trend, today])

  return useQueryV5({
    ...BranchCoverageMeasurementsQueryOpts({
      provider,
      owner,
      repo,
      branch,
      after: queryVars?.after,
      before: today,
      interval: queryVars.interval,
    }),
    select: (data) => {
      let coverage = []
      if (data.measurements?.[0]?.max === null) {
        data.measurements[0].max = 0
      }

      // set set initial coverage percentage
      let prevPercent = data?.measurements?.[0]?.max ?? 0
      coverage = data?.measurements?.map((measurement) => {
        const coverage = measurement?.max ?? prevPercent

        // can save on a few reassignments
        if (prevPercent !== coverage) {
          prevPercent = coverage
        }

        return { date: new Date(measurement?.timestamp), coverage }
      })

      const coverageChange =
        (coverage.at(-1)?.coverage ?? 0) - (coverage.at(0)?.coverage ?? 0)

      return { measurements: coverage, coverageChange }
    },
    enabled: !!overview?.oldestCommitAt,
    staleTime: 30000,
    ...options,
  })
}
