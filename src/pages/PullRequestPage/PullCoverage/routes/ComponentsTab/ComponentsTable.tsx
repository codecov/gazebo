import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isArray from 'lodash/isArray'
import qs, { type ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

import ComponentsNotConfigured from './ComponentsNotConfigured'
import { ComponentsComparison, useComponentComparison } from './hooks'

import ComponentsSelector from '../ComponentsSelector'

import 'ui/Table/Table.css'

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

const columnHelper = createColumnHelper<ComponentsComparison>()

const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: () => 'Name',
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('headTotals.percentCovered', {
    id: 'coverage',
    header: () => 'HEAD %',
    cell: ({ renderValue }) => (
      <TotalsNumber
        value={renderValue()}
        plain
        light
        showChange={false}
        large={false}
      />
    ),
  }),
  columnHelper.accessor('patchTotals.percentCovered', {
    id: 'patch',
    header: () => 'Patch %',
    cell: ({ renderValue }) => (
      <TotalsNumber
        value={renderValue()}
        plain
        light
        showChange={false}
        large={false}
      />
    ),
  }),
  columnHelper.accessor('baseTotals.percentCovered', {
    id: 'change',
    header: () => 'Change %',
    cell: ({ row }) => {
      const headCoverage = row?.original?.headTotals?.percentCovered
      const baseCoverage = row?.original?.baseTotals?.percentCovered

      let change = null
      if (headCoverage != null && baseCoverage != null) {
        change = headCoverage - baseCoverage
      }

      return (
        <TotalsNumber
          value={change}
          showChange
          data-testid="change-value"
          light
          plain={false}
          large={false}
        />
      )
    },
  }),
]

function getFilters({ components }: { components?: ParsedQs[] | string[] }) {
  return {
    ...(components ? { components } : {}),
  }
}

export default function ComponentsTable() {
  const location = useLocation()
  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  let components
  if (isArray(queryParams?.components) && queryParams?.components?.length > 0) {
    components = queryParams?.components
  }

  const filters = getFilters({ components })
  const { data, isLoading } = useComponentComparison({
    filters,
  })

  const tableData = useMemo(() => {
    if (
      data?.pull?.compareWithBase.__typename === 'Comparison' &&
      data?.pull?.compareWithBase.componentComparisons
    )
      return data?.pull?.compareWithBase?.componentComparisons
    return []
  }, [data])

  const isTableDataEmpty = tableData && tableData?.length <= 0

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isTableDataEmpty && !isLoading) {
    return <ComponentsNotConfigured />
  }

  return (
    <>
      <div className="my-2 flex flex-row-reverse">
        <ComponentsSelector />
      </div>
      <div className="tableui">
        <table>
          <colgroup>
            <col className="w-full @sm/table:w-10/12" />
            <col className="@sm/table:w-2/12" />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col">
                    <div
                      className={cs('flex gap-1 items-center justify-end', {
                        'flex-row-reverse': header.id === 'name',
                      })}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td>
                  <Loader />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cs('text-sm', {
                        'w-full max-w-0 font-medium @md/table:w-auto @md/table:max-w-none':
                          cell.column.id === 'name',
                        'flex justify-end':
                          cell.column.id === 'change' ||
                          cell.column.id === 'coverage',
                        'text-right': cell.column.id === 'patch',
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
