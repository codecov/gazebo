import { format } from 'date-fns'

import { useRepoFlags } from 'services/repo/useRepoFlags'

const headers = [
  {
    id: 'name',
    header: 'Flags',
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    width: 'w-6/12 min-w-min',
  },
  {
    id: 'coverage',
    header: (
      <span className="flex flex-row-reverse grow text-right">
        file coverage %
      </span>
    ),
    accessorKey: 'coverage',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-w-min',
  },
  {
    id: 'trend',
    header: (
      <span className="flex flex-row-reverse grow text-right">
        trend last year
      </span>
    ),
    accessorKey: 'trend',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-w-min',
  },
]

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
    headers,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  }
}

export default useRepoContentsTable
