import { format } from 'date-fns'

import { useRepoFlags } from 'services/repo/useRepoFlags'

function useRepoContentsTable() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRepoFlags({
      filters: {},
      orderingDirection: 'DESC', // TODO: Add support for sorting
      interval: 'INTERVAL_7_DAY', //TODO: Select interval based on selected date range
      beforeDate: format(new Date(), 'yyyy-MM-dd'),
      afterDate: '2022-01-01', //TODO: Select after date based on selected date range
    })

  return {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}

export default useRepoContentsTable
