import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useReposCoverageMeasurements } from 'services/charts/useReposCoverageMeasurements'
import { TierNames, useTier } from 'services/tier'
import { analyticsQuery } from 'shared/utils/timeseriesCharts'

interface URLParams {
  provider: string
  owner: string
}

interface UseCoverageArgs {
  params: {
    endDate: Date | null
    startDate: Date | null
    repositories: string[]
  }
  options?: {
    suspense?: boolean
    keepPreviousData?: boolean
  }
}

export const useCoverage = ({ params, options = {} }: UseCoverageArgs) => {
  const { provider, owner } = useParams<URLParams>()

  const { data: tierName } = useTier({ provider, owner })
  const shouldDisplayPublicReposOnly =
    tierName === TierNames.TEAM ? true : undefined

  const queryVars = analyticsQuery(params)

  const { data, ...rest } = useReposCoverageMeasurements({
    provider,
    owner,
    interval: queryVars?.interval,
    repos: queryVars?.repositories,
    before: queryVars?.endDate,
    after: queryVars?.startDate,
    isPublic: shouldDisplayPublicReposOnly,
    opts: {
      staleTime: 30000,
      keepPreviousData: false,
      ...options,
    },
  })

  return useMemo(() => {
    if (!data?.measurements) {
      return { ...rest, data: [] }
    }

    if (data?.measurements?.[0]?.avg === null) {
      data.measurements[0].avg = 0
    }

    // set prevPercent so we can reuse value if next value is null
    let prevPercent = data?.measurements?.[0]?.avg ?? 0
    const coverage = data?.measurements?.map((measurement) => {
      let coverage = measurement?.avg ?? prevPercent

      // can save on a few reassignments
      if (prevPercent !== coverage) {
        prevPercent = coverage
      }

      return {
        date: new Date(measurement?.timestamp),
        coverage,
      }
    })

    return { ...rest, data: coverage }
  }, [data?.measurements, rest])
}
