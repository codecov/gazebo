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
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import qs from 'qs'
import { Fragment, lazy, Suspense, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { ImpactedFileType, useCommit } from 'services/commit'
import { OrderingDirection, OrderingParameter } from 'services/pull/usePull'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

const CommitFileDiff = lazy(() => import('../shared/CommitFileDiff'))

const columnHelper = createColumnHelper<ImpactedFileType>()

const isNumericValue = (value: string) =>
  value === 'patchPercentage' || value === 'head' || value === 'change'

function getFilter(sorting: Array<{ id: string; desc: boolean }>) {
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

    if (state.id === 'head') {
      return {
        direction,
        parameter: OrderingParameter.HEAD_COVERAGE,
      }
    }

    if (state.id === 'patchPercentage') {
      return {
        direction,
        parameter: OrderingParameter.PATCH_COVERAGE,
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

function getColumns() {
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
              <div className="inline-flex items-center gap-1 font-sans">
                <Icon
                  size="md"
                  name={row.getIsExpanded() ? 'chevronDown' : 'chevronRight'}
                  variant="solid"
                />
                <span>{headName}</span>
              </div>
            ) : (
              <span>{headName}</span>
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
    columnHelper.accessor('headCoverage.coverage', {
      id: 'head',
      header: 'HEAD',
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
    columnHelper.accessor('patchCoverage.coverage', {
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
    columnHelper.accessor(
      (row) => {
        const headCov = row?.headCoverage?.coverage
        const baseCov = row?.baseCoverage?.coverage
        const patchCov = row?.patchCoverage?.coverage

        let change = Number.NaN
        if (isNumber(headCov) && isNumber(baseCov)) {
          change = headCov - baseCov
        }

        let coverageHasData = false
        if (isNumber(headCov) || isNumber(patchCov)) {
          coverageHasData = true
        }

        return { coverageHasData, change }
      },
      {
        id: 'change',
        header: 'Change',
        cell: ({ getValue }) => {
          const { coverageHasData, change } = getValue()
          if (coverageHasData) {
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
            return <>-</>
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
    { id: 'head', desc: false },
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
      ordering: getFilter(sorting),
    },
  })

  const commit = commitData?.commit

  const filesChanged = useMemo(() => {
    if (
      commit?.compareWithParent?.__typename === 'Comparison' &&
      commit?.compareWithParent?.impactedFiles?.__typename === 'ImpactedFiles'
    ) {
      return commit?.compareWithParent?.impactedFiles?.results ?? []
    }

    return []
  }, [commit?.compareWithParent])

  const table = useReactTable({
    columns: getColumns(),
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

  if (isLoading || commit?.state === 'pending') {
    return <Loader />
  }

  if (isEmpty(filesChanged) && !isLoading) {
    if (
      isArray(flags) ||
      (commit?.compareWithParent?.__typename === 'Comparison' &&
        commit?.compareWithParent?.impactedFiles?.__typename === 'UnknownFlags')
    ) {
      return (
        <p className="m-4">
          No files covered by tests and selected flags were changed
        </p>
      )
    }

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
                    'w-6/12': header.id === 'name',
                    'w-2/12 flex justify-end': header.id !== 'name',
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
        {table.getRowModel().rows.map((row, i) => (
          <Fragment key={i}>
            <div
              className="filelistui-row"
              data-action="clickable"
              data-testid="file-diff-expand"
              onClick={() => row.toggleExpanded()}
            >
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
                      'w-6/12': cell.column.id === 'name',
                      'w-2/12 justify-end	flex': cell.column.id !== 'name',
                    })}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                )
              })}
            </div>
            <div data-expanded={row.getIsExpanded()}>
              {row.getIsExpanded() ? <RenderSubComponent row={row} /> : null}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
