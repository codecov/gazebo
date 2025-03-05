import {
  keepPreviousData,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { useParams } from 'react-router-dom'

import { ReposCoverageMeasurementsQueryOpts } from 'services/charts/ReposCoverageMeasurementsQueryOpts'
import { useIsTeamPlan } from 'services/useIsTeamPlan'
import { analyticsQuery } from 'shared/utils/timeseriesCharts'

interface URLParams {
  provider: string
  owner: string
}

interface UseCoverageArgs {
  endDate: Date | null
  startDate: Date | null
  repositories: string[]
  opts?: {
    keepPrevious?: boolean
  }
}

export const useCoverage = ({
  startDate,
  endDate,
  repositories,
  opts,
}: UseCoverageArgs) => {
  const { provider, owner } = useParams<URLParams>()

  const { data: isTeamPlan } = useIsTeamPlan({ provider, owner })

  const queryVars = analyticsQuery({ startDate, endDate, repositories })

  return useQueryV5({
    ...ReposCoverageMeasurementsQueryOpts({
      provider,
      owner,
      interval: queryVars?.interval,
      repos: queryVars?.repositories,
      before: queryVars?.endDate,
      after: queryVars?.startDate,
      isPublic: isTeamPlan === true ? true : undefined,
    }),
    staleTime: 30000,
    placeholderData: opts?.keepPrevious ? keepPreviousData : undefined,
    select: (data) => {
      if (data?.measurements?.[0]?.avg === null) {
        data.measurements[0].avg = 0
      }

      // set prevPercent so we can reuse value if next value is null
      let prevPercent = data?.measurements?.[0]?.avg ?? 0
      const coverage = data?.measurements?.map((measurement) => {
        const coverage = measurement?.avg ?? prevPercent

        // can save on a few reassignments
        if (prevPercent !== coverage) {
          prevPercent = coverage
        }

        return {
          date: new Date(measurement?.timestamp),
          coverage,
        }
      })

      return coverage
    },
  })
}
