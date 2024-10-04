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
import { Fragment, lazy, Suspense, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  ImpactedFile,
  OrderingDirection,
  OrderingParameter,
  useCommitTeam,
} from 'services/commit/useCommitTeam'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

const CommitFileDiff = lazy(() => import('../shared/CommitFileDiff'))

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

function getColumns({ commitId }: { commitId: string }) {
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
                pageName: 'commitFileDiff',
                options: {
                  commit: commitId,
                  tree: headName,
                },
              }}
            >
              {headName}
            </A>
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
      <CommitFileDiff path={path} />
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
  commit: string
}

export default function FilesChangedTableTeam() {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'missedLines', desc: true },
  ])
  const { provider, owner, repo, commit: commitSHA } = useParams<URLParams>()

  const { data: commitData, isLoading } = useCommitTeam({
    provider,
    owner,
    repo,
    commitid: commitSHA,
    filters: {
      hasUnintendedChanges: false,
      ordering: getFilter(sorting),
    },
  })

  const filesChanged = useMemo(() => {
    if (
      commitData?.commit?.compareWithParent?.__typename === 'Comparison' &&
      commitData?.commit?.compareWithParent?.impactedFiles?.__typename ===
        'ImpactedFiles'
    ) {
      return commitData?.commit?.compareWithParent?.impactedFiles?.results
    }

    return []
  }, [commitData])

  const table = useReactTable({
    columns: getColumns({ commitId: commitSHA }),
    data: filesChanged,
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

  if (commitData?.commit?.state === 'pending') {
    return <Loader />
  }

  if (isEmpty(filesChanged) && !isLoading) {
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
                    'w-2/12':
                      header.id === 'missedLines' ||
                      header.id === 'patchPercentage',
                  })}
                >
                  <div
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse justify-end': header.id === 'name',
                      'justify-end': header.id === 'patchPercentage',
                    })}
                    {...(header.id === 'patchPercentage' ||
                    header.id === 'missedLines'
                      ? {
                          'data-type': 'numeric',
                        }
                      : {})}
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
