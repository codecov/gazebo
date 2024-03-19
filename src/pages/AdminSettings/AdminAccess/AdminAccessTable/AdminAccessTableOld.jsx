import Table from 'old_ui/Table'
import Button from 'ui/Button'

import { useAdminAccessList } from './useAdminAccessList'

const columns = [
  {
    id: 'admin',
    header: 'Admin',
    accessorKey: 'admin',
    cell: (info) => info.getValue(),
  },
]

const createTable = ({ tableData }) =>
  tableData?.length > 0
    ? tableData?.map(({ name, username }) => ({
        admin: <p>{name || username}</p>,
      }))
    : []

function AdminAccessTableOld() {
  const { data, isFetching, hasNextPage, fetchNextPage } = useAdminAccessList()

  const tableContent = createTable({
    tableData: data,
  })

  return (
    <>
      <Table data={tableContent} columns={columns} />
      {hasNextPage && (
        <div className="mt-4 flex w-full justify-center">
          <Button
            hook="load-more"
            isLoading={isFetching}
            onClick={() => fetchNextPage()}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}

export default AdminAccessTableOld
