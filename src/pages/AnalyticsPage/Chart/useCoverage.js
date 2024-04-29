import { format } from 'date-fns'
import isFunction from 'lodash/isFunction'
import { useParams } from 'react-router-dom'

import { useReposCoverageMeasurements } from 'services/charts/useReposCoverageMeasurements'
import { TierNames, useTier } from 'services/tier'
import {
  analyticsQuery,
  TimeseriesInterval,
} from 'shared/utils/timeseriesCharts'

export const useCoverage = ({ params, options = {} }) => {
  const { provider, owner } = useParams()

  const { select, ...newOptions } = options
  const { data: tierName } = useTier({ provider, owner })
  const shouldDisplayPublicReposOnly = tierName === TierNames.TEAM ? true : null

  const queryVars = analyticsQuery(params)

  return useReposCoverageMeasurements({
    provider,
    owner,
    interval: queryVars?.interval,
    repos: queryVars?.repositories,
    before: queryVars?.endDate,
    after: queryVars?.startDate,
    isPublic: shouldDisplayPublicReposOnly,
    opts: {
      select: (data) => {
        if (data?.measurements?.[0]?.avg === null) {
          data.measurements[0].avg = 0
        }

        // set prevPercent so we can reuse value if next value is null
        let prevPercent = data?.measurements?.[0]
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

        const coverageChange =
          coverage?.[coverage?.length - 1]?.coverage - coverage?.[0]?.coverage

        const coverageAxisLabel = (time) => {
          switch (queryVars?.interval) {
            case TimeseriesInterval.INTERVAL_1_DAY:
              return format(time, 'MMM d, yy')
            case TimeseriesInterval.INTERVAL_7_DAY:
              return format(time, 'MMM d, yy')
            default:
              return format(time, 'MMM yyyy')
          }
        }

        const newData = {
          coverageAxisLabel,
          coverageChange,
          coverage,
        }

        if (isFunction(select)) {
          return select(newData)
        }

        return newData
      },
      staleTime: 30000,
      keepPreviousData: false,
      ...newOptions,
    },
  })
}
