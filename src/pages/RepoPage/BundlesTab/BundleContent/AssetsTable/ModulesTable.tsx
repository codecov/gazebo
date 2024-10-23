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

import { useBundleAssetModules } from 'services/bundleAnalysis/useBundleAssetModules'
import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'

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
  changeOverTime: null
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
    cell: ({ renderValue }) => renderValue(),
  }),
  columnHelper.accessor('loadTime', {
    header: 'Estimated load time (3G)',
    cell: ({ getValue }) => formatTimeToString(getValue()),
  }),
  columnHelper.accessor('size', {
    header: 'Size',
    cell: ({ getValue }) => (
      <p className="pr-1">{formatSizeToString(getValue())}</p>
    ),
  }),
  columnHelper.accessor('changeOverTime', {
    header: 'Change over time',
    cell: () => null,
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
        changeOverTime: null,
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
    <div className="filelistui bg-ds-gray-primary" data-highlight-row="onHover">
      <div>
        {table.getRowModel().rows.map((row) => (
          <div key={row.id} className="filelistui-row">
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                {...(isNumericValue(cell.column.id)
                  ? {
                      'data-type': 'numeric',
                    }
                  : {})}
                className={cs({
                  'w-full @4xl/filelist:w-5/12': cell.column.id === 'name',
                  'w-2/12 hidden @4xl/filelist:block text-right':
                    cell.column.id === 'loadTime' || cell.column.id === 'size',
                  'w-1/12 hidden @4xl/filelist:flex grow justify-end gap-2':
                    cell.column.id === 'changeOverTime',
                  'w-1/12 hidden @4xl/filelist:block text-right':
                    cell.column.id === 'extension',
                })}
              >
                <div className="mb-6 flex justify-between gap-8 @md/filelist:justify-start @4xl/filelist:hidden">
                  <div>Type: {row.original.extension}</div>
                  <div>
                    Size:{' '}
                    <span className="font-mono">
                      {formatSizeToString(row.original.size)}
                    </span>
                  </div>
                  <div>
                    Estimated load time (3G):{' '}
                    <span className="font-mono">
                      {formatTimeToString(row.original.loadTime)}
                    </span>
                  </div>
                </div>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModulesTable
