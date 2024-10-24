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
import isNumber from 'lodash/isNumber'
import qs from 'qs'
import { Fragment, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import {
  ImpactedFile,
  OrderingDirection,
  OrderingParameter,
  usePull,
} from 'services/pull/usePull'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

const PullFileDiff = lazy(() => import('../FileDiff'))

const columnHelper = createColumnHelper<ImpactedFile>()

const isNumericValue = (value: string) =>
  value === 'missedLines' ||
  value === 'patchPercentage' ||
  value === 'head' ||
  value === 'change'

export function getFilter(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting[0]

  if (state) {
    const direction = state?.desc
      ? OrderingDirection.desc
      : OrderingDirection.asc

    if (state.id === 'name') {
      return {
        direction,
        parameter: OrderingParameter.FILE_NAME,
      }
    }

    if (state.id === 'missedLines') {
      return {
        direction,
        parameter: OrderingParameter.MISSES_COUNT,
      }
    }

    if (state.id === 'patchPercentage') {
      return {
        direction,
        parameter: OrderingParameter.PATCH_COVERAGE,
      }
    }

    if (state.id === 'head') {
      return {
        direction,
        parameter: OrderingParameter.HEAD_COVERAGE,
      }
    }

    if (state.id === 'change') {
      return {
        direction,
        parameter: OrderingParameter.CHANGE_COVERAGE,
      }
    }
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
        const isDeletedFile = row.original?.headCoverage === null

        return (
          <div className="flex flex-row items-center break-all">
            {!isDeletedFile ? (
              <span
                data-action="clickable"
                data-testid="file-diff-expand"
                className={cs(
                  'inline-flex items-center gap-1 font-sans hover:underline focus:ring-2',
                  {
                    'text-ds-blue-default': row.getIsExpanded(),
                  }
                )}
                onClick={row.getToggleExpandedHandler()}
              >
                <Icon
                  size="md"
                  name={row.getIsExpanded() ? 'chevronDown' : 'chevronRight'}
                  variant="solid"
                />
              </span>
            ) : null}
            {isDeletedFile ? (
              <>{headName}</>
            ) : (
              /* @ts-expect-error */
              <A
                to={{
                  pageName: 'pullFileView',
                  options: { pullId, tree: headName },
                }}
              >
                {headName}
              </A>
            )}
            {row.original?.isCriticalFile ? (
              <span className="ml-2 h-fit flex-none rounded border border-ds-gray-tertiary p-1 text-xs text-ds-gray-senary">
                Critical file
              </span>
            ) : null}
            {isDeletedFile ? (
              <div className="ml-2 h-fit flex-none rounded border border-ds-gray-tertiary p-1 text-xs text-ds-gray-senary">
                Deleted file
              </div>
            ) : null}
          </div>
        )
      },
    }),
    columnHelper.accessor('missesCount', {
      id: 'missedLines',
      header: 'Missed lines',
      cell: ({ renderValue, row }) => {
        if (!row.original?.headCoverage) {
          return <>-</>
        }
        return renderValue()
      },
    }),
    columnHelper.accessor('headCoverage.percentCovered', {
      id: 'head',
      header: 'Head %',
      cell: ({ getValue }) => {
        const value = getValue()

        return (
          <div className="flex w-full justify-end">
            <TotalsNumber
              value={value}
              plain={true}
              light={false}
              showChange={false}
              large={false}
            />
          </div>
        )
      },
    }),
    columnHelper.accessor('patchCoverage.percentCovered', {
      id: 'patchPercentage',
      header: 'Patch %',
      cell: ({ getValue }) => {
        const value = getValue()

        return (
          <div className="flex w-full justify-end">
            <TotalsNumber
              value={value}
              plain={false}
              light={false}
              showChange={false}
              large={false}
            />
          </div>
        )
      },
    }),
    columnHelper.accessor('headCoverage.percentCovered', {
      id: 'change',
      header: 'Change %',
      cell: ({ row }) => {
        const headCoverage = row.original?.headCoverage?.percentCovered
        const baseCoverage = row.original?.baseCoverage?.percentCovered
        const changeCoverage =
          isNumber(headCoverage) && isNumber(baseCoverage)
            ? headCoverage - baseCoverage
            : Number.NaN

        return (
          <div className="flex w-full justify-end">
            <TotalsNumber
              value={changeCoverage}
              plain={false}
              light={false}
              showChange
              large={false}
            />
          </div>
        )
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

export default function FilesChangedTable() {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'missedLines', desc: true },
  ])
  const { provider, owner, repo, pullId } = useParams<URLParams>()
  const location = useLocation()
  const params = qs.parse(location.search, {
    ignoreQueryPrefix: true,
  })
  const currentlySelectedFile = params.filepath

  const { data: pullData, isLoading } = usePull({
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

  const data = useMemo(() => {
    if (
      pullData?.pull?.compareWithBase?.__typename === 'Comparison' &&
      pullData?.pull?.compareWithBase?.impactedFiles?.__typename ===
        'ImpactedFiles'
    ) {
      return pullData?.pull?.compareWithBase?.impactedFiles?.results ?? []
    }
    return []
  }, [pullData?.pull?.compareWithBase])

  useEffect(() => {
    if (data && data.length > 0 && currentlySelectedFile) {
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
                  onClick={header.column.getToggleSortingHandler()}
                  className={cs({
                    'w-8/12': header.id === 'name',
                    'w-1/12 flex justify-end': header.id !== 'name',
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
                      {...(isNumericValue(cell.column.id)
                        ? {
                            'data-type': 'numeric',
                          }
                        : {})}
                      className={cs({
                        'w-8/12': cell.column.id === 'name',
                        'w-1/12 justify-end	flex': cell.column.id !== 'name',
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
