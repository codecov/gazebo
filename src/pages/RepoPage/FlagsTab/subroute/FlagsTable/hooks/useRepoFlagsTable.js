import { format, sub } from 'date-fns'
import _snakeCase from 'lodash/snakeCase'
import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLocationParams } from 'services/navigation'
import { useRepo } from 'services/repo'
import { useRepoFlags } from 'services/repo/useRepoFlags'
import { SortingDirection } from 'ui/Table/constants'

import {
  AFTER_DATE_FORMAT_OPTIONS,
  MEASUREMENT_TIME_INTERVALS,
} from '../../../constants'

const getSortByDirection = (sortBy) =>
  sortBy.length > 0 && sortBy[0].desc
    ? SortingDirection.DESC
    : SortingDirection.ASC

const getMeasurementVariables = (historicalTrend, oldestCommitAt) => {
  const trend = _snakeCase(historicalTrend).toUpperCase()
  const isAllTime = !Boolean(trend) || trend === 'ALL_TIME'
  const selectedDate = isAllTime
    ? new Date(oldestCommitAt)
    : sub(new Date(), { ...AFTER_DATE_FORMAT_OPTIONS[trend] })
  const afterDate = format(selectedDate, 'yyyy-MM-dd')
  const interval = isAllTime
    ? MEASUREMENT_TIME_INTERVALS.ALL_TIME
    : MEASUREMENT_TIME_INTERVALS[trend]

  return { afterDate, interval }
}

function useRepoFlagsTable() {
  const { params } = useLocationParams({ search: '', historicalTrend: '' })
  const { provider, owner, repo } = useParams()
  const { data: repoData } = useRepo({
    provider,
    owner,
    repo,
  })
  const isSearching = Boolean(params?.search)
  const [sortBy, setSortBy] = useState(SortingDirection.ASC)
  const { afterDate, interval } = getMeasurementVariables(
    params?.historicalTrend,
    repoData?.repository?.oldestCommitAt
  )

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRepoFlags({
      filters: { term: params?.search },
      orderingDirection: sortBy,
      beforeDate: format(new Date(), 'yyyy-MM-dd'),
      interval,
      afterDate,
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
