import { format } from 'date-fns'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useLegacyRepoCoverage } from 'services/charts'
import { useLocationParams } from 'services/navigation'
import {
  getTrendEnum,
  GroupingUnit,
  legacyRepoCoverageQuery,
} from 'shared/utils/legacyCharts'

export function useRepoCoverageTimeseries({ branch }, options = {}) {
  const { select, ...newOptions } = options
  const { params } = useLocationParams()
  const { repo, owner, provider } = useParams()

  const today = useMemo(() => new Date(), [])
  const body = useMemo(
    () =>
      legacyRepoCoverageQuery({
        branch,
        repo,
        trend: getTrendEnum(params?.trend),
        today,
      }),
    [repo, branch, today, params?.trend]
  )

  return useLegacyRepoCoverage({
    provider,
    owner,
    branch,
    trend: params.trend,
    body,
    opts: {
      select: (data) => {
        const coverageAxisLabel = (time) => {
          switch (body?.groupingUnit) {
            case GroupingUnit.HOUR:
              return format(time, 'E, h:mm aaa')
            case GroupingUnit.DAY:
              return format(time, 'MMM d')
            case GroupingUnit.WEEK:
              return format(time, 'MMM')
            default:
              return format(time, 'MMM yyyy')
          }
        }

        const coverage = data.coverage.map((coverage) => ({
          ...coverage,
          date: new Date(coverage.date),
        }))

        const newData = {
          ...data,
          coverageChange:
            data.coverage[data.coverage?.length - 1].coverage -
            data.coverage[0].coverage,
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
}
