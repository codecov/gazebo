import {
  createColumnHelper,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { Fragment, Suspense, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useBundleAssets } from 'services/bundleAnalysis'
import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'
import Icon from 'ui/Icon'
import Sparkline from 'ui/Sparkline'
import Spinner from 'ui/Spinner'

import {
  genSizeColumn,
  sortChangeOverTimeColumn,
  sortSizeColumn,
} from './assetTableHelpers'
import EmptyTable from './EmptyTable'
import ModulesTable from './ModulesTable'

const isNumericValue = (value: string) =>
  value === 'size' || value === 'loadTime'

interface ChangeOverTimeProps {
  change?: number | null
  hasMeasurements: boolean
}

export function ChangeOverTime({
  change,
  hasMeasurements,
}: ChangeOverTimeProps) {
  if (change) {
    const formattedChange = formatSizeToString(change)
    if (change > 0) {
      return <span className="inline">+{formattedChange} &#x1F53C;</span>
    } else if (change < 0) {
      return <span className="inline">{formattedChange} &#x1F53D;</span>
    }
  }

  if (hasMeasurements) {
    return <span>-</span>
  }

  return null
}

interface Column {
  name: string
  extension: string
  size: number
  loadTime: number
  changeOverTime:
    | {
        change: {
          size: {
            uncompress: number
          }
        } | null
        measurements:
          | {
              avg: number | null
              timestamp: string
            }[]
          | null
      }
    | null
    | undefined
}

const columnHelper = createColumnHelper<Column>()

const createColumns = (totalBundleSize: number | null) => [
  columnHelper.accessor('name', {
    header: 'Asset',
    cell: ({ getValue, row }) => {
      return (
        <p className="flex flex-row items-center break-all">
          <span
            data-action="clickable"
            data-testid="modules-expand"
            className={cs(
              'inline-flex items-center justify-items-center gap-1 font-sans hover:underline focus:ring-2',
              {
                'text-ds-blue': row.getIsExpanded(),
              }
            )}
            onClick={() => row.toggleExpanded()}
          >
            <Icon
              size="md"
              name={row.getIsExpanded() ? 'chevronDown' : 'chevronRight'}
              variant="solid"
            />
          </span>
          {getValue()}
        </p>
      )
    },
  }),
  columnHelper.accessor('extension', {
    header: 'Type',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('loadTime', {
    header: 'Estimated load time (3G)',
    cell: ({ getValue }) => formatTimeToString(getValue()),
  }),
  columnHelper.accessor('size', {
    header: 'Size',
    cell: ({ getValue }) => {
      return genSizeColumn({ size: getValue(), totalBundleSize })
    },
    sortingFn: (rowA, rowB) => {
      return sortSizeColumn({
        rowA: rowA.original.size,
        rowB: rowB.original.size,
        totalBundleSize,
      })
    },
  }),
  columnHelper.accessor('changeOverTime', {
    header: 'Change over time',
    sortUndefined: -1,
    sortingFn: (rowA, rowB) => {
      return sortChangeOverTimeColumn({
        rowA: rowA.original.changeOverTime?.change?.size.uncompress,
        rowB: rowB.original.changeOverTime?.change?.size.uncompress,
      })
    },
    cell: ({ getValue, row }) => {
      const value = getValue()
      let prevSize = 0
      let maxSize = -Infinity
      if (value && 'measurements' in value) {
        const measurementLength = value?.measurements?.length ?? 0
        value?.measurements?.forEach(({ avg }: { avg: number | null }) => {
          if (avg && avg > maxSize) {
            maxSize = avg * 1.05
          }
        })

        const sizes =
          value?.measurements?.map(({ avg }: { avg: number | null }) => {
            if (avg) {
              const percentage = avg / maxSize
              prevSize = percentage
              return percentage
            }
            return prevSize
          }) ?? []

        return (
          <>
            <Sparkline
              datum={sizes}
              select={(d) => d}
              dataTemplate={(d) =>
                d ? `${formatSizeToString(d * maxSize)}` : 'No Data Available'
              }
              description={`Bundle ${row.getValue('name')} trend sparkline`}
              lineFallBack={0}
              taperEndPoint={false}
            />{' '}
            <ChangeOverTime
              change={value?.change?.size?.uncompress}
              hasMeasurements={measurementLength > 0 ?? false}
            />
          </>
        )
      }

      return undefined
    },
  }),
]

interface URLParams {
  provider: string
  owner: string
  repo: string
  branch: string
  bundle: string
}

interface LoaderProps {
  className?: string
}

const Loader = ({ className }: LoaderProps) => (
  <div className={cs('flex justify-center py-4', className)}>
    <Spinner />
  </div>
)

export const AssetsTable: React.FC = () => {
  const tableRef = useRef<HTMLDivElement | null>(null)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState([{ id: 'size', desc: true }])
  const { provider, owner, repo, branch, bundle } = useParams<URLParams>()

  const { data, isLoading } = useBundleAssets({
    provider,
    owner,
    repo,
    branch,
    bundle,
    opts: { enabled: bundle !== '' },
  })

  const tableData: Array<Column> = useMemo(() => {
    if (data?.assets) {
      return data.assets.map((asset) => ({
        name: asset.name,
        extension: asset.extension,
        size: asset.bundleData.size.uncompress,
        loadTime: asset.bundleData.loadTime.threeG,
        changeOverTime: asset.measurements ?? undefined,
      }))
    }

    return []
  }, [data])

  const columns = useMemo(
    () => createColumns(data?.bundleUncompressSize ?? null),
    [data?.bundleUncompressSize]
  )

  const table = useReactTable({
    columns,
    data: tableData,
    state: {
      sorting,
      expanded,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  if (data?.assets?.length === 0) {
    return <EmptyTable />
  }

  return (
    <div className="filelistui" data-highlight-row="onHover">
      <div ref={tableRef}>
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="filelistui-thead">
            {headerGroup.headers.map((header) => {
              return (
                <div
                  key={header.id}
                  data-sortable="true"
                  onClick={header.column.getToggleSortingHandler()}
                  className={cs({
                    'w-full @4xl/filelist:w-5/12': header.column.id === 'name',
                    'w-2/12 hidden @4xl/filelist:block text-right':
                      header.column.id === 'loadTime' ||
                      header.column.id === 'size',
                    'w-1/12 hidden @4xl/filelist:flex grow justify-end':
                      header.column.id === 'changeOverTime',
                    'w-1/12 hidden @4xl/filelist:block text-right':
                      header.column.id === 'extension',
                  })}
                  {...(isNumericValue(header.id)
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                >
                  <div
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse justify-end': header.id === 'name',
                      'flex-row justify-end': header.id !== 'name',
                    })}
                  >
                    <span
                      className="text-ds-blue-darker"
                      data-sort-direction={header.column.getIsSorted()}
                    >
                      <Icon name="arrowUp" size="sm" />
                    </span>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        {isLoading ? (
          <Loader />
        ) : (
          <div>
            {table.getRowModel().rows.map((row, i) => {
              const isExpanded = row.getIsExpanded()
              return (
                <Fragment key={row.getValue('name')}>
                  <div
                    className={cs('filelistui-row', {
                      'bg-ds-gray-primary sticky': isExpanded,
                    })}
                  >
                    {row.getVisibleCells().map((cell) => {
                      let changeOverTime = '-'
                      if (
                        row.original.changeOverTime &&
                        'change' in row.original.changeOverTime &&
                        row.original.changeOverTime.change
                      ) {
                        changeOverTime = formatSizeToString(
                          row.original.changeOverTime.change.size.uncompress
                        )
                      }

                      return (
                        <div
                          key={cell.id}
                          {...(isNumericValue(cell.column.id)
                            ? {
                                'data-type': 'numeric',
                              }
                            : {})}
                          className={cs({
                            'w-full @4xl/filelist:w-5/12':
                              cell.column.id === 'name',
                            'w-2/12 hidden @4xl/filelist:block text-right':
                              cell.column.id === 'loadTime' ||
                              cell.column.id === 'size',
                            'w-1/12 hidden @4xl/filelist:flex grow justify-end gap-2':
                              cell.column.id === 'changeOverTime',
                            'w-1/12 hidden @4xl/filelist:block text-right':
                              cell.column.id === 'extension',
                          })}
                        >
                          <div className="mb-6 flex justify-between gap-8 @md/filelist:justify-start @4xl/filelist:hidden">
                            <div>Type: {row.original.extension}</div>
                            <div>
                              Estimated load time (3G):{' '}
                              <span className="font-mono">
                                {formatTimeToString(row.original.loadTime)}
                              </span>
                            </div>
                            <div>
                              Size:{' '}
                              <span className="font-mono">
                                {genSizeColumn({
                                  size: row.original.size,
                                  totalBundleSize: data?.bundleUncompressSize,
                                })}
                              </span>
                            </div>
                            <div>Change over time: {changeOverTime}</div>
                          </div>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div data-expanded={row.getIsExpanded()}>
                    {row.getIsExpanded() ? (
                      <Suspense
                        fallback={<Loader className="bg-ds-gray-secondary" />}
                        key={i}
                      >
                        <ModulesTable asset={row.getValue('name')} />
                      </Suspense>
                    ) : null}
                  </div>
                </Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
