import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBranchBundleSummary } from 'services/branches'
import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'
import Icon from 'ui/Icon'

import 'ui/Table/Table.css'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface BundleColumn {
  name: string
  currSize: number
  loadTime: number
}

const columnHelper = createColumnHelper<BundleColumn>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Bundle name',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('currSize', {
    header: 'Current size',
    cell: (info) => formatSizeToString(info.getValue()),
  }),
  columnHelper.accessor('loadTime', {
    header: 'Estimated load time (3G)',
    cell: (info) => formatTimeToString(info.getValue()),
  }),
]

export const useTableData = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const { data } = useBranchBundleSummary({ provider, owner, repo })

  return useMemo(() => {
    if (
      data?.branch?.head?.bundleAnalysisReport?.__typename !==
      'BundleAnalysisReport'
    ) {
      return []
    }

    return data?.branch?.head?.bundleAnalysisReport?.bundles?.map((bundle) => ({
      name: bundle.name,
      currSize: bundle.sizeTotal,
      loadTime: bundle.loadTimeTotal,
    }))
  }, [data])
}

const BundleTable: React.FC = () => {
  const [sorting, setSorting] = useState([{ id: 'currSize', desc: true }])

  const data = useTableData()
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isEmpty(data)) {
    return <p className="p-4">No bundles were found in this commit</p>
  }

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="w-full @sm/table:w-8/12" />
          <col className="@sm/table:w-2/12" />
          <col className="@sm/table:w-2/12" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  data-sortable={header.column.getCanSort()}
                  {...{
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  <div
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse': header.id !== 'name',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span
                      className="text-ds-blue-darker group-hover/columnheader:opacity-100"
                      data-sort-direction={header.column.getIsSorted()}
                    >
                      <Icon name="arrowUp" size="sm" />
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  {...(cell.column.id !== 'name'
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BundleTable
