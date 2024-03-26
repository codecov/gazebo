import { format, sub } from 'date-fns'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  AFTER_DATE_FORMAT_OPTIONS,
  MEASUREMENT_TIME_INTERVALS,
  TIME_OPTION_VALUES,
  TimeOptionValues,
} from 'pages/RepoPage/FlagsTab/constants'
import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRepoFlags } from 'services/repo/useRepoFlags'

type OrderingDirection = 'ASC' | 'DESC'

const getSortByDirection = (sortBy: { id: string; desc: boolean }[]) =>
  sortBy.length > 0 && sortBy[0]?.desc ? 'DESC' : 'ASC'

const useMeasurementVariables = (
  historicalTrend: TimeOptionValues,
  oldestCommitAt?: string | null
) => {
  const isAllTime =
    !Boolean(historicalTrend) || historicalTrend === TIME_OPTION_VALUES.ALL_TIME
  const selectedDate =
    isAllTime && oldestCommitAt
      ? new Date(oldestCommitAt)
      : sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS[historicalTrend] })
  const afterDate = format(selectedDate, 'yyyy-MM-dd')
  const interval = isAllTime
    ? MEASUREMENT_TIME_INTERVALS.ALL_TIME
    : MEASUREMENT_TIME_INTERVALS[historicalTrend]

  return { afterDate, interval }
}

type URLParams = {
  provider: string
  owner: string
  repo: string
}

function useRepoFlagsTable() {
  // @ts-expect-error
  const {
    params,
  }: {
    params: {
      search: string
      historicalTrend: TimeOptionValues
      flags: string[]
    }
  } = useLocationParams({
    search: '',
    historicalTrend: '',
    flags: [],
  })

  const { provider, owner, repo } = useParams<URLParams>()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const isAdmin = repoData?.isAdmin
  const isSearching = Boolean(params?.search)
  const [sortBy, setSortBy] = useState<OrderingDirection>('ASC')
  const { afterDate, interval } = useMeasurementVariables(
    params?.historicalTrend,
    repoData?.repository?.oldestCommitAt
  )

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRepoFlags({
      filters: { term: params?.search, flagsNames: params?.flags },
      orderingDirection: sortBy,
      beforeDate: format(new Date(), 'yyyy-MM-dd'),
      interval,
      afterDate,
      suspense: false,
    })

  const handleSort = useCallback(
    (tableSortBy: { id: string; desc: boolean }[]) => {
      const tableSortByDirection = getSortByDirection(tableSortBy)
      if (sortBy !== tableSortByDirection) {
        setSortBy(tableSortByDirection)
      }
    },
    [sortBy]
  )

  return {
    data,
    isAdmin,
    isLoading,
    handleSort,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }
}

export default useRepoFlagsTable
