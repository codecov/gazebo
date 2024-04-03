import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'

import Spinner from 'ui/Spinner'

import 'ui/Table/Table.css'
import { useAdminAccessList } from './useAdminAccessList'

type AdminAccessTableColumn = {
  name: string
  email: string
}

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

function LoadMoreTrigger({
  intersectionRef,
}: {
  intersectionRef: React.Ref<HTMLSpanElement>
}) {
  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading
    </span>
  )
}

const columnHelper = createColumnHelper<AdminAccessTableColumn>()
const columns = [
  columnHelper.accessor('name', { header: 'Admin' }),
  columnHelper.accessor('email', { header: 'Email' }),
]

function AdminAccessTable() {
  const { ref, inView } = useInView()
  const {
    data: adminList,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useAdminAccessList()

  const data = useMemo(
    () =>
      adminList.map((admin) => ({
        name: admin.name || admin.username || admin.ownerid.toString(),
        email: admin.email || '',
      })),
    [adminList]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  return (
    <>
      <div className="tableui">
        <table>
          <colgroup>
            <col className="@sm/table:w-1/2" />
            <col className="@sm/table:w-1/2" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isFetching ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}

export default AdminAccessTable
