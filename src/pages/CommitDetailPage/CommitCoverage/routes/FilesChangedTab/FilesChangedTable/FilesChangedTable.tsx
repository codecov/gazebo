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
import { isArray, isNumber } from 'lodash'
import qs from 'qs'
import { Fragment, Suspense, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { ImpactedFileType, useCommit } from 'services/commit'
import { OrderingDirection, OrderingParameter } from 'services/pull/usePull'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import 'ui/FileList/FileList.css'
import TotalsNumber from 'ui/TotalsNumber'

import CommitFileDiff from '../shared/CommitFileDiff'

const columnHelper = createColumnHelper<ImpactedFileType>()

const isNumericValue = (value: string) =>
  value === 'missedLines' ||
  value === 'patchPercentage' ||
  value === 'head' ||
  value === 'change'

const getFileData = (row: any, commit: any) => {
  const headCov = row?.headCoverage?.coverage
  const patchCov = row?.patchCoverage?.coverage
  const baseCov = row?.baseCoverage?.coverage

  let change = Number.NaN
  if (isNumber(headCov) && isNumber(baseCov)) {
    change = headCov - baseCov
  }

  let hasData = false
  if (isNumber(headCov) || isNumber(patchCov)) {
    hasData = true
  }

  return {
    headCoverage: headCov,
    patchCoverage: patchCov,
    baseCoverage: baseCov,
    hasData,
    change,
    headName: row?.headName,
    commit,
  }
}

export function getFilter(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting.at(0)

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

    if (state.id === 'coverage') {
      return {
        direction,
        parameter: OrderingParameter.MISSES_COUNT,
      }
    }

    if (state.id === 'patch') {
      return {
        direction,
        parameter: OrderingParameter.PATCH_COVERAGE,
      }
    }

    if (state.id === 'change') {
      return {
        direction,
        parameter: OrderingParameter.HEAD_COVERAGE,
      }
    }
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
                  'text-ds-blue': row.getIsExpanded(),
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
    columnHelper.accessor('headCoverage.coverage', {
      id: 'coverage',
      header: 'HEAD',
      cell: ({ getValue }) => {
        const value = getValue()

        if ((value && !isNaN(value)) || value === 0) {
          return <span>{value?.toFixed(2)}%</span>
        }
        return <>-</>
      },
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
    columnHelper.accessor(
      (row) => {
        const headCov = row?.headCoverage?.coverage
        const baseCov = row?.baseCoverage?.coverage

        const isValid = headCov && !isNaN(headCov) && baseCov && !isNaN(baseCov)
        return isValid ? headCov - baseCov : NaN
      },
      {
        id: 'change',
        header: 'Change',
        cell: ({ getValue }) => {
          const change = getValue()
          if (!isNaN(change)) {
            return (
              <TotalsNumber
                value={change}
                showChange
                data-testid="change-value"
                plain={undefined}
                light={undefined}
                large={undefined}
              />
            )
          } else {
            return (
              <span className="ml-4 text-sm text-ds-gray-quinary">No data</span>
            )
          }
        },
      }
    ),
  ]
}

function RenderSubComponent({ row }: { row: Row<ImpactedFileType> }) {
  const nameColumn = row.original?.headName

  return (
    <Suspense fallback={<Loader />}>
      <CommitFileDiff path={nameColumn} />
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

export default function FilesChangedTable() {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'missedLines', desc: true },
  ])
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const location = useLocation()

  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  let flags = undefined
  let components = undefined
  if (isArray(queryParams?.flags) && queryParams?.flags?.length > 0) {
    flags = queryParams?.flags
  }

  if (isArray(queryParams?.components) && queryParams?.components?.length > 0) {
    components = queryParams?.components
  }

  const { data: commitData, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSha,
    filters: {
      hasUnintendedChanges: false,
      flags: flags,
      components: components,
    },
  })

  const commit = commitData?.commit

  const filesChanged = useMemo(() => {
    if (
      commit?.compareWithParent?.__typename === 'Comparison' &&
      commit?.compareWithParent?.impactedFiles?.__typename === 'ImpactedFiles'
    ) {
      return commit?.compareWithParent?.impactedFiles?.results
    }

    return []
  }, [commit?.compareWithParent])

  const formattedData = filesChanged?.map((row: any) =>
    getFileData(row, commit)
  )

  const table = useReactTable({
    columns: getColumns({ commitId: commitSha }),
    data: formattedData,
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

  if (isLoading || commit?.state === 'pending') {
    return <Loader />
  }

  // if (isEmpty(filesChanged) && !isLoading) {
  //   if (
  //     isArray(flags) ||
  //     (commit?.compareWithParent?.__typename === 'Comparison' &&
  //       commit?.compareWithParent?.impactedFiles?.__typename === 'UnknownFlags')
  //   ) {
  //     return (
  //       <p className="m-4">
  //         No files covered by tests and selected flags were changed
  //       </p>
  //     )
  //   }

  //   return <p className="m-4">No files covered by tests were changed</p>
  // }

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
                      {...(isNumericValue(cell.column.id)
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
