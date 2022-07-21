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

function createTableData({ tableData }) {
  return tableData?.length > 0
    ? tableData.map(
        ({ name, percentCovered, percentChange, measurements }) => ({
          name: (
            <>
              <div className="flex gap-2">
                <span>{name}</span>
              </div>
            </>
          ),
          coverage: (
            <div className="flex flex-1 gap-2 items-center">
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

function FlagsTable() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useRepoFlagsTable()

  const tableData = useMemo(
    () =>
      createTableData({
        tableData: data,
      }),
    [data]
  )

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center">
        <Spinner size={60} />
      </div>
    )
  }

  return (
    <>
      <Table data={tableData} columns={headers} />
      {tableData?.length === 0 && (
        <p className="flex justify-center flex-1">
          {/*TODO: Check different table state messages with AJ*/}
          There was a problem getting flags data from your provider
        </p>
      )}
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
