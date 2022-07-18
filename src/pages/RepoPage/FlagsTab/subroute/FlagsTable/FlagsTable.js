import { useMemo } from 'react'

import Button from 'ui/Button'
import Progress from 'ui/Progress'
import Spinner from 'ui/Spinner'
import Table from 'ui/Table'

import useRepoFlagsTable from './hooks'

function createTableData({ tableData }) {
  return tableData?.length > 0
    ? tableData.map(({ node }) => ({
        name: (
          <>
            <div className="flex gap-2">
              <span>{node.name}</span>
            </div>
          </>
        ),
        coverage: (
          <div className="flex flex-1 gap-2 items-center">
            <Progress amount={node.percentCovered} label />
          </div>
        ),
        //TODO: Implement trend component
        trend: (
          <div className="flex flex-1 gap-2 items-center">
            <span> {node.name} trend data </span>
          </div>
        ),
      }))
    : []
}

function FlagsTable() {
  const {
    data,
    headers,
    isLoading,
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
