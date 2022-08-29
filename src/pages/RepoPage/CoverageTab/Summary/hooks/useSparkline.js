import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useLegacyRepoCoverage } from 'services/charts'
import { useLocationParams } from 'services/navigation'
import { getTrendEnum, sparklineQuery } from 'shared/utils/legacyCharts'

export function useSparkline({ branch }, options) {
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

  return {
    coverageChange,
    coverage,
    ...rest,
  }
}
