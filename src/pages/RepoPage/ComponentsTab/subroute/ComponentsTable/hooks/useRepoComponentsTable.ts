import { format, sub } from 'date-fns'
import { useParams } from 'react-router-dom'

import {
  AFTER_DATE_FORMAT_OPTIONS,
  MEASUREMENT_TIME_INTERVALS,
  TIME_OPTION_KEY,
  TIME_OPTION_VALUES,
} from 'pages/RepoPage/shared/constants'
import { useLocationParams } from 'services/navigation'
import { useRepo, useRepoComponents } from 'services/repo'

const getSortByDirection = (isDesc: boolean) => (isDesc ? 'DESC' : 'ASC')

const createMeasurementVariables = (
  historicalTrend: TIME_OPTION_KEY,
  oldestCommitAt = format(
    sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS.LAST_6_MONTHS }),
    'yyyy-MM-dd'
  )
) => {
  const isAllTime = historicalTrend === TIME_OPTION_VALUES.ALL_TIME
  const selectedDate = isAllTime
    ? new Date(oldestCommitAt)
    : sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS[historicalTrend] })
  const after = format(selectedDate, 'yyyy-MM-dd')
  const interval = isAllTime
    ? MEASUREMENT_TIME_INTERVALS.ALL_TIME
    : MEASUREMENT_TIME_INTERVALS[historicalTrend]

  return { after, interval }
}

type URLParams = {
  provider: string
  owner: string
  repo: string
  branch?: string
}

function useRepoComponentsTable(isDesc = false) {
  const { params } = useLocationParams({
    search: '',
    historicalTrend: TIME_OPTION_VALUES.LAST_3_MONTHS,
    components: [],
  })
  const { provider, owner, repo, branch } = useParams<URLParams>()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const isAdmin = repoData?.isAdmin
  // @ts-expect-error Need to type useLocationParams
  const isSearching = Boolean(params?.components?.length)
  const { after, interval } = createMeasurementVariables(
    // @ts-expect-error Need to type useLocationParams
    params?.historicalTrend
      ? // @ts-expect-error
        params.historicalTrend
      : TIME_OPTION_VALUES.LAST_3_MONTHS,
    repoData?.repository?.oldestCommitAt ?? undefined
  )

  const { data, isLoading } = useRepoComponents({
    // @ts-expect-error Need to type useLocationParams
    filters: Boolean(params?.components?.length)
      ? // @ts-expect-error Need to type useLocationParams
        { components: params?.components }
      : {},
    orderingDirection: getSortByDirection(isDesc),
    before: format(new Date(), 'yyyy-MM-dd'),
    interval,
    after,
    branch,
    opts: { suspense: false },
  })

  return {
    data: data?.components || [],
    isAdmin,
    isLoading,
    isSearching,
  }
}

export default useRepoComponentsTable
