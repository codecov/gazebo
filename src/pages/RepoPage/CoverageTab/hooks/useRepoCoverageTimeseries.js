import { format } from 'date-fns'
import { useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useLegacyRepoCoverage } from 'services/charts'
import { useLocationParams } from 'services/navigation'
import {
  getTrendEnum,
  GroupingUnit,
  sparklineQuery,
} from 'shared/utils/legacyCharts'

export function useRepoCoverageTimeseries({ branch }, options) {
  const { params } = useLocationParams()
  const { repo, owner, provider } = useParams()

  const today = useMemo(() => new Date(), [])
  const body = useMemo(
    () =>
      sparklineQuery({
        branch,
        repo,
        trend: getTrendEnum(params?.trend),
        today,
      }),
    [repo, branch, today, params?.trend]
  )
  const {
    data: { coverage },
    ...rest
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

  const coverageAxisLabel = useCallback(
    (time) => {
      switch (body?.groupingUnit) {
        case GroupingUnit.HOUR:
          return format(time, 'MMM dd, h:mm aaa')
        case GroupingUnit.DAY:
          return format(time, 'MMM d')
        case GroupingUnit.WEEK:
          return format(time, 'MMM')
        default:
          return format(time, 'MMM yyyy')
      }
    },
    [body]
  )

  return {
    coverageAxisLabel,
    coverageChange,
    coverage,
    ...rest,
  }
}
