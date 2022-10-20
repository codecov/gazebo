import { useMemo } from 'react'

import Button from 'ui/Button'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import useRepoFlagsTable from './hooks'
import TableSparkline from './TableEntries/TableSparkline'

const headers = [
  {
    id: 'name',
    header: 'Flags',
    accessorKey: 'name',
    cell: (info) => info.getValue(),
    width: 'w-6/12 min-w-min',
    justifyStart: true,
  },
  {
    id: 'coverage',
    header: 'Coverage %',
    accessorKey: 'coverage',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-w-min',
    enableSorting: false,
  },
  {
    id: 'trend',
    header: 'Trend',
    accessorKey: 'trend',
    cell: (info) => info.getValue(),
    width: 'w-3/12 min-w-min',
    enableSorting: false,
  },
]

function createTableData({ tableData }) {
  return tableData?.length > 0
    ? tableData.map(
        ({ name, percentCovered, percentChange, measurements }) => ({
          name: <span>{name}</span>,
          coverage: (
            <div className="flex flex-1 gap-2 items-center font-lato">
              <Progress amount={percentCovered} label />
            </div>
          ),
          trend: (
            <TableSparkline
              measurements={measurements}
              change={percentChange}
              name={name}
            />
          ),
        })
      )
    : []
}

const Loader = () => (
  <div className="flex-1 flex justify-center">
    <Spinner size={60} />
  </div>
)

const getEmptyStateText = ({ isSearching }) =>
  isSearching ? 'No results found' : 'There was a problem getting flags data'

function FlagsTable() {
  const {
    data,
    isLoading,
    handleSort,
    isSearching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRepoFlagsTable()

  const tableData = useMemo(
    () =>
      createTableData({
        tableData: data,
      }),
    [data]
  )

  return (
    <>
      <Table data={tableData} columns={headers} onSort={handleSort} />
      {tableData?.length === 0 && !isLoading && (
        <p className="flex justify-center flex-1">
          {getEmptyStateText({ isSearching })}
        </p>
      )}
      {isLoading && <Loader />}
      {hasNextPage && (
        <div className="flex-1 mt-4 flex justify-center">
          <Button
            hook="load-more"
            isLoading={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}
export default FlagsTable
