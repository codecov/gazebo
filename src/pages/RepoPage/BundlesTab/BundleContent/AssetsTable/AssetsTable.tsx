import {
  createColumnHelper,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Fragment, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { useParams } from 'react-router-dom'

import { OrderingDirection } from 'types'

import { useFlags } from 'shared/featureFlags'
import {
  formatSizeToString,
  formatTimeToString,
  SUPPORTED_FILE_PATH_PLUGINS,
} from 'shared/utils/bundleAnalysis'
import { cn } from 'shared/utils/cn'
import Icon from 'ui/Icon'
import Sparkline from 'ui/Sparkline'
import Spinner from 'ui/Spinner'

import { genSizeColumn } from './assetTableHelpers'
import { EmptyTable, EmptyTableWithFilePath } from './EmptyTable'
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
  filePath: string[] | undefined
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

const createColumns = (
  totalBundleSize: number | null,
  includeFilePath: boolean
) => {
  const nameColumn = columnHelper.accessor('name', {
    header: 'Asset',
    cell: ({ getValue, row }) => {
      return (
        <p className="flex flex-row items-center break-all">
          <span
            data-action="clickable"
            data-testid="modules-expand"
            className={cn(
              'inline-flex items-center justify-items-center gap-1 font-sans hover:underline focus:ring-2',
              { 'text-ds-blue-default': row.getIsExpanded() }
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
  })

  const filePathColumn = columnHelper.accessor('filePath', {
    header: includeFilePath ? 'File path' : undefined,
    cell: (info) => info.renderValue()?.at(-1) ?? '',
  })

  const extensionColumn = columnHelper.accessor('extension', {
    header: 'Type',
    cell: (info) => info.renderValue(),
  })

  const loadTimeColumn = columnHelper.accessor('loadTime', {
    header: 'Est. load time (3G)',
    cell: ({ getValue }) => formatTimeToString(getValue()),
  })

  const sizeColumn = columnHelper.accessor('size', {
    header: 'Size',
    cell: ({ getValue }) => {
      return genSizeColumn({ size: getValue(), totalBundleSize })
    },
  })

  const changeOverTimeColumn = columnHelper.accessor('changeOverTime', {
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
  })

  return [
    nameColumn,
    filePathColumn,
    extensionColumn,
    loadTimeColumn,
    sizeColumn,
    changeOverTimeColumn,
  ]
}

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
  <div className={cn('flex justify-center py-4', className)}>
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
  const { renderBundleFilePathColumn } = useFlags({
    renderBundleFilePathColumn: false,
  })

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

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    useBundleAssetsTable({
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

  const tableData = useMemo(() => {
    if (data) {
      return {
        bundleInfo: data?.pages[0]?.bundleInfo,
        assets: data?.pages
          .map((page) => page.assets)
          .flat()
          .filter(Boolean)
          .map((asset) => ({
            name: asset!.name,
            filePath: asset!.routes ?? undefined,
            extension: asset!.extension,
            size: asset!.bundleData.size.uncompress,
            loadTime: asset!.bundleData.loadTime.threeG,
            changeOverTime: asset!.measurements ?? undefined,
          })),
      }
    }

    return {
      assets: [],
      bundleInfo: null,
    }
  }, [data])

  const bundleSize = useMemo(
    () => data?.pages?.[0]?.bundleData?.size?.uncompress ?? null,
    [data?.pages]
  )

  const includeFilePath =
    renderBundleFilePathColumn &&
    SUPPORTED_FILE_PATH_PLUGINS.includes(tableData.bundleInfo?.pluginName ?? '')

  const columns = useMemo(
    () => createColumns(bundleSize, includeFilePath),
    [bundleSize, includeFilePath]
  )

  const table = useReactTable({
    columns,
    data: tableData.assets,
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

  if (tableData.assets.length === 0 && !isLoading) {
    return includeFilePath ? <EmptyTableWithFilePath /> : <EmptyTable />
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
                    className={cn({
                      'w-full @4xl/filelist:w-7/24':
                        header.column.id === 'name',
                      'w-4/24 hidden @4xl/filelist:block text-right':
                        header.column.id === 'loadTime' ||
                        header.column.id === 'size',
                      'w-4/24 hidden @4xl/filelist:flex justify-end':
                        header.column.id === 'changeOverTime',
                      'w-3/24 hidden @4xl/filelist:block text-right':
                        header.column.id === 'filePath',
                      'w-2/24 hidden @4xl/filelist:block text-right':
                        header.column.id === 'extension',
                    })}
                    {...(isNumericValue(header.id)
                      ? { 'data-type': 'numeric' }
                      : {})}
                  >
                    <div
                      className={cn('flex items-center gap-1', {
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
                  <Fragment key={row.id}>
                    <div
                      className={cn('filelistui-row', {
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
                              ? { 'data-type': 'numeric' }
                              : {})}
                            className={cn({
                              'w-full @4xl/filelist:w-7/24 grow':
                                cell.column.id === 'name',
                              'w-4/24 hidden @4xl/filelist:block text-right':
                                cell.column.id === 'loadTime' ||
                                cell.column.id === 'size',
                              'w-4/24 hidden @4xl/filelist:flex justify-end gap-2':
                                cell.column.id === 'changeOverTime',
                              'w-3/24 hidden @4xl/filelist:block text-right':
                                cell.column.id === 'filePath',
                              'w-2/24 hidden @4xl/filelist:block text-right':
                                cell.column.id === 'extension',
                            })}
                          >
                            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] justify-between justify-items-stretch gap-x-8 gap-y-2 @md/filelist:justify-start @4xl/filelist:hidden">
                              <div>
                                File path:{' '}
                                {row.original.filePath?.at(-1) ?? '-'}
                              </div>
                              <div>Type: {row.original.extension}</div>
                              <div>
                                Est. load time (3G):{' '}
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
                          key={i}
                          fallback={<Loader className="bg-ds-gray-secondary" />}
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
