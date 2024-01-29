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
import { isNumber } from 'lodash'
import isEmpty from 'lodash/isEmpty'
import qs from 'qs'
import { Fragment, lazy, Suspense, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { ImpactedFile, useCommit } from 'services/commit/useCommit'
import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import 'ui/FileList/FileList.css'
import TotalsNumber from 'ui/TotalsNumber'

const CommitFileDiff = lazy(() => import('./CommitFileDiff'))

const columnHelper = createColumnHelper<ImpactedFile>()

const isNumericValue = (value: string) => value === 'head' || value === 'change'

function getColumns({ commitid }: { commitid: string }) {
  return [
    columnHelper.accessor('headName', {
      id: 'name',
      header: 'Name',
      cell: ({ getValue }) => {
        const headName = getValue()

        return (
          <div className="flex flex-col break-all">
            <A
              hook="commitFileDiffLink"
              isExternal={false}
              to={{
                pageName: 'commitFileDiff',
                options: { commit: commitid, tree: headName },
              }}
            >
              {headName}
            </A>
          </div>
        )
      },
    }),
    columnHelper.accessor('headCoverage', {
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
    columnHelper.accessor('baseCoverage', {
      id: 'change',
      header: 'Change %',
      cell: ({ row }) => {
        const headCoverage = row.original?.headCoverage
        const baseCoverage = row.original?.baseCoverage
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

  const flags = queryParams?.flags?.length ? queryParams?.flags : undefined
  const components = queryParams?.components?.length
    ? queryParams?.components
    : undefined

  const { data: commitData, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSha,
    filters: {
      flags,
      components,
      hasUnintendedChanges: true,
    },
  })

  let mostRecentCompare = undefined
  if (commitData?.commit?.compareWithParent?.__typename === 'Comparison') {
    mostRecentCompare = commitData?.commit?.compareWithParent
  }

  const data = useMemo(() => {
    if (
      commitData?.commit?.compareWithParent?.__typename === 'Comparison' &&
      commitData?.commit?.compareWithParent?.impactedFiles?.__typename ===
        'ImpactedFiles'
    ) {
      return commitData?.commit?.compareWithParent?.impactedFiles?.results
    }
    return []
  }, [commitData?.commit?.compareWithParent])

  const table = useReactTable({
    columns: getColumns({ commitid: commitSha }),
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
