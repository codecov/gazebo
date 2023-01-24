import { format, sub } from 'date-fns'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  AFTER_DATE_FORMAT_OPTIONS,
  MEASUREMENT_TIME_INTERVALS,
} from 'pages/RepoPage/FlagsTab/constants'
import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRepoFlags } from 'services/repo/useRepoFlags'
import { SortingDirection } from 'ui/Table/constants'

const getSortByDirection = (sortBy) =>
  sortBy.length > 0 && sortBy[0].desc
    ? SortingDirection.DESC
    : SortingDirection.ASC

const useMeasurementVariables = (historicalTrend, oldestCommitAt) => {
  const isAllTime = !Boolean(historicalTrend) || historicalTrend === 'ALL_TIME'
  const selectedDate = isAllTime
    ? new Date(oldestCommitAt)
    : sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS[historicalTrend] })
  const afterDate = format(selectedDate, 'yyyy-MM-dd')
  const interval = isAllTime
    ? MEASUREMENT_TIME_INTERVALS.ALL_TIME
    : MEASUREMENT_TIME_INTERVALS[historicalTrend]

  return { afterDate, interval }
}

function useRepoFlagsTable() {
  const { params } = useLocationParams({
    search: '',
    historicalTrend: '',
    flags: [],
  })
  const { provider, owner, repo } = useParams()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const isSearching = Boolean(params?.search)
  const [sortBy, setSortBy] = useState(SortingDirection.ASC)
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
    (tableSortBy) => {
      const tableSortByDirection = getSortByDirection(tableSortBy)
      if (sortBy !== tableSortByDirection) {
        setSortBy(tableSortByDirection)
      }
    },
    [sortBy]
  )

  return {
    data,
    isLoading,
    handleSort,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }
}

export default useRepoFlagsTable
