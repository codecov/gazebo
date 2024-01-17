import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import gt from 'lodash/gt'
import isEmpty from 'lodash/isEmpty'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { usePullBundleList } from 'services/pull/usePullBundleList'
import { formatSizeToString } from 'shared/utils/bundleAnalysis'
import Icon from 'ui/Icon'
import 'ui/Table/Table.css'

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

interface BundleColumn {
  name: string
  prevSize: number
  newSize: number
  change: number
}

const columnHelper = createColumnHelper<BundleColumn>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Bundle name',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('prevSize', {
    header: 'Previous size',
    cell: (info) => formatSizeToString(info.getValue()),
  }),
  columnHelper.accessor('newSize', {
    header: 'New size',
    cell: (info) => formatSizeToString(info.getValue()),
  }),
  columnHelper.accessor('change', {
    header: 'Change',
    cell: (info) => {
      const value = info.getValue()
      if (gt(value, 0)) {
        return `+${formatSizeToString(value)}`
      }
      return formatSizeToString(value)
    },
  }),
]

export const useTableData = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data } = usePullBundleList({
    provider,
    owner,
    repo,
    pullId: Number(pullId),
  })

  return useMemo(() => {
    if (
      data?.pull?.bundleAnalysisCompareWithBase?.__typename !==
      'BundleAnalysisComparison'
    ) {
      return []
    }

    return data?.pull?.bundleAnalysisCompareWithBase?.bundles?.map(
      (bundle) => ({
        name: bundle.name,
        prevSize: bundle.sizeTotal - bundle.sizeDelta,
        newSize: bundle.sizeTotal,
        change: bundle.sizeDelta,
      })
    )
  }, [data])
}

const BundleTable: React.FC = () => {
  const [sorting, setSorting] = useState([{ id: 'change', desc: true }])

  const tableData = useTableData()
  const table = useReactTable({
    data: tableData,
    columns: columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (isEmpty(tableData)) {
    return <p className="m-4">No bundles were found in this pull</p>
  }

  return (
    <div className="tableui pt-12">
      <table>
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

const PullBundleAnalysisTable: React.FC = () => {
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const { data } = usePullBundleList({
    provider,
    owner,
    repo,
    pullId: Number(pullId),
  })

  if (
    data?.pull?.bundleAnalysisCompareWithBase?.__typename !==
    'BundleAnalysisComparison'
  ) {
    return null
  }

  return <BundleTable />
}

export default PullBundleAnalysisTable
