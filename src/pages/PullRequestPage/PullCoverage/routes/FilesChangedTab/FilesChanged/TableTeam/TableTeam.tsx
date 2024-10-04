import {
  createColumnHelper,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isEmpty from 'lodash/isEmpty'
import qs from 'qs'
import { Fragment, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
  ImpactedFile,
  OrderingDirection,
  OrderingParameter,
  usePullTeam,
} from 'services/pull/usePullTeam'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

const PullFileDiff = lazy(() => import('../FileDiff'))

const columnHelper = createColumnHelper<ImpactedFile>()

const isNumericColumn = (cellId: string) =>
  cellId === 'missedLines' || cellId === 'patchPercentage'

export function getFilter(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting[0]

  if (state) {
    const direction = state?.desc
      ? OrderingDirection.desc
      : OrderingDirection.asc

    let parameter = undefined
    if (state.id === 'name') {
      parameter = OrderingParameter.FILE_NAME
    }

    if (state.id === 'missedLines') {
      parameter = OrderingParameter.MISSES_COUNT
    }

    if (state.id === 'patchPercentage') {
      parameter = OrderingParameter.PATCH_COVERAGE
    }

    return { direction, parameter }
  }

  return undefined
}

function getColumns({ pullId }: { pullId: string }) {
  return [
    columnHelper.accessor('headName', {
      id: 'name',
      header: 'Name',
      cell: ({ getValue, row }) => {
        const headName = getValue()

        return (
          <div className="flex flex-row break-all">
            <span
              data-action="clickable"
              data-testid="file-diff-expand"
              className={cs(
                'inline-flex items-center gap-1 font-sans hover:underline focus:ring-2',
                {
                  'text-ds-blue-default': row.getIsExpanded(),
                }
              )}
              {...{
                onClick: row.getToggleExpandedHandler(),
              }}
            >
              <Icon
                size="md"
                name={row.getIsExpanded() ? 'chevronDown' : 'chevronRight'}
                variant="solid"
              />
            </span>
            {/* @ts-expect-error */}
            <A
              to={{
                pageName: 'pullFileView',
                options: { pullId, tree: headName },
              }}
            >
              {headName}
            </A>
            {row.original?.isCriticalFile && (
              <span className="ml-2 rounded border border-ds-gray-tertiary p-1 text-xs text-ds-gray-senary">
                Critical File
              </span>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('missesCount', {
      id: 'missedLines',
      header: 'Missed lines',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('patchCoverage.coverage', {
      id: 'patchPercentage',
      header: 'Patch %',
      cell: ({ getValue }) => {
        const value = getValue()

        if ((value && !isNaN(value)) || value === 0) {
          return <span>{value?.toFixed(2)}%</span>
        }

        return <>-</>
      },
    }),
  ]
}

function RenderSubComponent({ row }: { row: Row<ImpactedFile> }) {
  const path = row.original?.headName

  return (
    <Suspense fallback={<Loader />}>
      <PullFileDiff path={path} />
    </Suspense>
  )
}

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

interface URLParams {
  provider: string
  owner: string
  repo: string
  pullId: string
}

export default function FilesChangedTableTeam() {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'missedLines', desc: true },
  ])
  const { provider, owner, repo, pullId } = useParams<URLParams>()

  const { data: pullData, isLoading } = usePullTeam({
    provider,
    owner,
    repo,
    pullId,
    filters: {
      hasUnintendedChanges: false,
      ordering: getFilter(sorting),
    },
  })

  let mostRecentCompare = undefined
  if (pullData?.pull?.compareWithBase?.__typename === 'Comparison') {
    mostRecentCompare = pullData?.pull?.compareWithBase
  }

  const location = useLocation()
  const params = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })
  const currentlySelectedFile = params.filepath

  const data = useMemo(() => {
    if (
      pullData?.pull?.compareWithBase?.__typename === 'Comparison' &&
      pullData?.pull?.compareWithBase?.impactedFiles?.__typename ===
        'ImpactedFiles'
    ) {
      return pullData?.pull?.compareWithBase?.impactedFiles?.results
    }
    return []
  }, [pullData?.pull?.compareWithBase])

  useEffect(() => {
    if (data.length > 0 && currentlySelectedFile) {
      const fileToExpandIndex = data.findIndex(
        (file) => file && file.headName === currentlySelectedFile
      )
      if (fileToExpandIndex !== -1) {
        setExpanded({
          [fileToExpandIndex]: true,
        })
      }
    }
  }, [data, currentlySelectedFile])

  const table = useReactTable({
    columns: getColumns({ pullId }),
    data,
    state: {
      expanded,
      sorting,
    },
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  })

  if (mostRecentCompare?.state === 'pending') {
    return <Loader />
  }

  if (isEmpty(data) && !isLoading) {
    return <p className="m-4">No files covered by tests were changed</p>
  }

  return (
    <div className="filelistui" data-highlight-row="onHover">
      <div>
        {table.getHeaderGroups().map((headerGroup) => (
          <div key={headerGroup.id} className="filelistui-thead">
            {headerGroup.headers.map((header) => {
              const isSorted = header.column.getIsSorted()

              return (
                <div
                  key={header.id}
                  data-sortable="true"
                  {...{
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                  className={cs({
                    'w-8/12': header.id === 'name',
                    'w-2/12 flex':
                      header.id === 'missedLines' ||
                      header.id === 'patchPercentage',
                  })}
                  {...(header.id === 'patchPercentage' ||
                  header.id === 'missedLines'
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                >
                  <div
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse justify-end': header.id === 'name',
                      'justify-end': header.id === 'patchPercentage',
                    })}
                  >
                    <span
                      className="text-ds-blue-darker"
                      data-sort-direction={isSorted}
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
          table.getRowModel().rows.map((row, i) => (
            <Fragment key={i}>
              <div className="filelistui-row">
                {row.getVisibleCells().map((cell) => {
                  return (
                    <div
                      key={cell.id}
                      {...(isNumericColumn(cell.column.id)
                        ? {
                            'data-type': 'numeric',
                          }
                        : {})}
                      className={cs({
                        'w-8/12': cell.column.id === 'name',
                        'w-2/12':
                          cell.column.id === 'missedLines' ||
                          cell.column.id === 'patchPercentage',
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  )
                })}
              </div>
              <div data-expanded={row.getIsExpanded()}>
                {row.getIsExpanded() ? <RenderSubComponent row={row} /> : null}
              </div>
            </Fragment>
          ))
        )}
      </div>
    </div>
  )
}
