import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBundleAssetModules } from 'services/bundleAnalysis'
import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'

import 'ui/Table/Table.css'

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
}

const isNumericValue = (value: string) =>
  value === 'size' || value === 'loadTime'

interface Column {
  name: string
  extension: string
  size: number
  loadTime: number
}

const columnHelper = createColumnHelper<Column>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Asset',
    cell: ({ getValue, row }) => {
      return <p className="max-w-xl truncate">{getValue()}</p>
    },
  }),
  columnHelper.accessor('extension', {
    header: 'Type',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('size', {
    header: 'Size',
    cell: ({ getValue }) => formatSizeToString(getValue()),
  }),
  columnHelper.accessor('loadTime', {
    header: 'Estimated load time (3G)',
    cell: ({ getValue }) => formatTimeToString(getValue()),
  }),
]

interface ModulesTableProps {
  asset: string
}

const ModulesTable: React.FC<ModulesTableProps> = ({ asset }) => {
  const { provider, owner, repo, branch, bundle } = useParams<URLParams>()
  const [sorting, setSorting] = useState([{ id: 'size', desc: true }])

  const { data } = useBundleAssetModules({
    provider,
    owner,
    repo,
    branch,
    bundle,
    asset,
    opts: { enabled: bundle !== '' },
  })

  const tableData = useMemo(() => {
    if (data?.modules.length) {
      return data.modules.map((module) => ({
        name: module.name,
        extension: module.extension,
        size: module.bundleData.size.uncompress,
        loadTime: module.bundleData.loadTime.threeG,
      }))
    }

    return []
  }, [data])

  const table = useReactTable({
    columns,
    data: tableData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (tableData.length === 0) {
    return (
      <div className="flex items-center justify-center border-t border-ds-gray-tertiary bg-ds-gray-primary py-4">
        No modules found for this asset.
      </div>
    )
  }

  return (
    <div className="tableui bg-ds-gray-primary">
      <table>
        <colgroup>
          <col className="w-full @sm/table:w-6/12" />
          <col className="@sm/table:w-3/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-2/12" />
        </colgroup>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-ds-gray-tertiary">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  {...(isNumericValue(cell.column.id)
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                  className={cs({
                    'text-right': cell.column.id !== 'name',
                  })}
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

export default ModulesTable
