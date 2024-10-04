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
import { Fragment, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { OrderingDirection } from 'types'

import {
  formatSizeToString,
  formatTimeToString,
} from 'shared/utils/bundleAnalysis'
import Icon from 'ui/Icon'
import Sparkline from 'ui/Sparkline'
import Spinner from 'ui/Spinner'

import { genSizeColumn } from './assetTableHelpers'
import { EmptyTable } from './EmptyTable'
import ModulesTable from './ModulesTable'
import { useBundleAssetsTable } from './useBundleAssetsTable'

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
                'text-ds-blue-default': row.getIsExpanded(),
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
  }),
  columnHelper.accessor('changeOverTime', {
    header: 'Change over time',
    enableSorting: false,
    cell: ({ getValue, row }) => {
      const value = getValue()
      let prevSize = 0
      let maxSize = -Infinity
      if (value && value?.measurements) {
        // find the maxSize to scale the sparkline
        value.measurements.forEach(({ avg }: { avg: number | null }) => {
          if (avg && avg > maxSize) {
            maxSize = avg * 1.05
          }
        })

        // convert sizes to percentages of the maxSize
        const sizes = value.measurements.map(({ avg }) => {
          if (avg) {
            const percentage = avg / maxSize
            prevSize = percentage
            return percentage
          }
          return prevSize
        })

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
              change={value?.change?.size.uncompress}
              hasMeasurements={value.measurements.length > 0}
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

function LoadMoreTrigger({ intersectionRef }: { intersectionRef: any }) {
  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-200px] block leading-[0]"
    >
      Loading
    </span>
  )
}

export const AssetsTable: React.FC = () => {
  const { ref, inView } = useInView()
  const tableRef = useRef<HTMLDivElement | null>(null)
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState([{ id: 'size', desc: true }])
  const { provider, owner, repo, branch, bundle } = useParams<URLParams>()

  let ordering: 'NAME' | 'SIZE' | 'TYPE' | undefined
  const sortColumn = sorting?.[0]?.id
  if (sortColumn === 'name') {
    ordering = 'NAME'
  }
  // load time is directly proportional to size so we can sort by size
  else if (sortColumn === 'size' || sortColumn === 'loadTime') {
    ordering = 'SIZE'
  } else if (sortColumn === 'extension') {
    ordering = 'TYPE'
  }

  let orderingDirection: OrderingDirection | undefined
  if (sorting[0]?.desc) {
    orderingDirection = 'DESC'
  } else if (!sorting[0]?.desc) {
    orderingDirection = 'ASC'
  }

  const {
    data,
    fetchNextPage,
    isInitialLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useBundleAssetsTable({
    provider,
    owner,
    repo,
    branch,
    bundle,
    ordering,
    orderingDirection,
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView])

  const tableData: Array<Column> = useMemo(() => {
    if (data) {
      return data?.pages
        .map((page) => page.assets)
        .flat()
        .filter(Boolean)
        .map((asset) => ({
          name: asset!.name,
          extension: asset!.extension,
          size: asset!.bundleData.size.uncompress,
          loadTime: asset!.bundleData.loadTime.threeG,
          changeOverTime: asset!.measurements ?? undefined,
        }))
    }

    return []
  }, [data])

  const bundleSize = useMemo(
    () => data?.pages?.[0]?.bundleData?.size?.uncompress ?? null,
    [data?.pages]
  )

  const columns = useMemo(() => createColumns(bundleSize), [bundleSize])

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

  if (tableData.length === 0 && !isInitialLoading) {
    return <EmptyTable />
  }

  return (
    <>
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
                      'w-full @4xl/filelist:w-5/12':
                        header.column.id === 'name',
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
          {isInitialLoading ? (
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
                                    totalBundleSize: bundleSize,
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
      {isFetchingNextPage ? <Loader /> : null}
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </>
  )
}
