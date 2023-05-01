import { format } from 'date-fns'
import isFunction from 'lodash/isFunction'
import { useParams } from 'react-router-dom'

import { useOrgCoverage } from 'services/charts'
import { useReposCoverageMeasurements } from 'services/charts/useReposCoverageMeasurements'
import { useFlags } from 'shared/featureFlags'
import { chartQuery, GroupingUnit } from 'shared/utils/legacyCharts'
import {
  analyticsQuery,
  TimeseriesInterval,
} from 'shared/utils/timeseriesCharts'

export const useCoverage = ({ params, options = {} }) => {
  const { provider, owner } = useParams()
  const { analyticsPageTimeSeries } = useFlags({
    analyticsPageTimeSeries: false,
  })

  const { select, ...newOptions } = options
  const query = chartQuery(params)

  const queryVars = analyticsQuery(params)

  const timeseriesCoverage = useReposCoverageMeasurements({
    provider,
    owner,
    interval: queryVars?.interval,
    repos: queryVars?.repositories,
    before: queryVars?.endDate,
    after: queryVars?.startDate,
    opts: {
      enabled: !!analyticsPageTimeSeries,
      select: (data) => {
        if (data?.measurements?.[0]?.max === null) {
          data.measurements[0].max = 0
        }

        // set prevPercent so we can reuse value if next value is null
        let prevPercent = data?.measurements?.[0]
        const coverage = data?.measurements?.map((measurement) => {
          let coverage = measurement?.max ?? prevPercent

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

  const orgCoverage = useOrgCoverage({
    provider,
    owner,
    query,
    opts: {
      enabled: !analyticsPageTimeSeries,
      select: (data) => {
        const coverage = data.coverage.map((coverage) => ({
          ...coverage,
          date: new Date(coverage.date),
        }))
        const coverageAxisLabel = (time) => {
          if (query?.groupingUnit === GroupingUnit.DAY) {
            return format(time, 'MMM d, yy')
          } else {
            return format(time, 'MMM yyyy')
          }
        }

        const newData = {
          ...data,
          coverageAxisLabel,
          coverage,
        }

        if (typeof select === 'function') {
          return select(newData)
        } else {
          return newData
        }
      },
      staleTime: 30000,
      keepPreviousData: false,
      ...newOptions,
    },
  })

  if (analyticsPageTimeSeries) {
    return timeseriesCoverage
  }

  return orgCoverage
}
