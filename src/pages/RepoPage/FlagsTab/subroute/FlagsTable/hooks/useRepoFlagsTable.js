import { format } from 'date-fns'
import { useCallback, useState } from 'react'

import { useRepoFlags } from 'services/repo/useRepoFlags'
import { SortingDirection } from 'ui/Table/constans'

const getSortByDirection = (sortBy) =>
  sortBy.length > 0 && sortBy[0].desc
    ? SortingDirection.DESC
    : SortingDirection.ASC

function useRepoFlagsTable() {
  const [sortBy, setSortBy] = useState(SortingDirection.ASC)
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRepoFlags({
      filters: {},
      orderingDirection: sortBy,
      interval: 'INTERVAL_7_DAY', //TODO: Select interval based on selected date range
      beforeDate: format(new Date(), 'yyyy-MM-dd'),
      afterDate: '2022-01-01', //TODO: Select after date based on selected date range
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
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }
}

export default useRepoFlagsTable
