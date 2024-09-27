import { format } from 'date-fns'
import isFunction from 'lodash/isFunction'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useBranchCoverageMeasurements } from 'services/charts/useBranchCoverageMeasurements'
import { useLocationParams } from 'services/navigation'
import { useRepoOverview } from 'services/repo'
import {
  createTimeSeriesQueryVars,
  getTrendEnum,
  TimeseriesInterval,
} from 'shared/utils/timeseriesCharts'

export function useRepoCoverageTimeseries({ branch }, options = {}) {
  const { select, ...newOptions } = options
  const { params } = useLocationParams()
  const { repo, owner, provider } = useParams()
  const { data: overview } = useRepoOverview({ provider, owner, repo })

  const today = useMemo(() => new Date(), [])

  const queryVars = useMemo(() => {
    const trend = getTrendEnum(params?.trend) ?? '3 months'
    const oldestCommit = overview?.oldestCommitAt
      ? new Date(overview?.oldestCommitAt)
      : null
    return createTimeSeriesQueryVars({ trend, oldestCommit, today })
  }, [overview?.oldestCommitAt, params?.trend, today])

  console.log('here at least')

  return useBranchCoverageMeasurements({
    provider,
    owner,
    repo,
    branch,
    after: queryVars?.after,
    before: today,
    interval: queryVars.interval,
    opts: {
      enabled: !!overview?.oldestCommitAt,
      staleTime: 30000,
      keepPreviousData: false,
      select: (data) => {
        console.log({ data })
        if (data?.measurements?.[0]?.max === null) {
          data.measurements[0].max = 0
        }

        // set set initial t
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
              return format(time, 'MMM d')
            case TimeseriesInterval.INTERVAL_7_DAY:
              return format(time, 'MMM')
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
      ...newOptions,
    },
  })
}
