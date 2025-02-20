import {
  createColumnHelper,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import isArray from 'lodash/isArray'
import isEmpty from 'lodash/isEmpty'
import isNumber from 'lodash/isNumber'
import qs from 'qs'
import { Fragment, Suspense, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import ToggleHeader from 'pages/CommitDetailPage/Header/ToggleHeader/ToggleHeader'
import { ImpactedFileType, useCommit } from 'services/commit/useCommit'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

import CommitFileDiff from './CommitFileDiff'

const columnHelper = createColumnHelper<ImpactedFileType>()

const isNumericValue = (value: string) => value === 'head' || value === 'change'

function getColumns() {
  return [
    columnHelper.accessor('headName', {
      id: 'name',
      header: 'Name',
      cell: ({ getValue, row }) => {
        const headName = getValue()
        const isDeletedFile = row.original?.headCoverage === null

        return (
          <div className="flex items-center gap-2">
            {!isDeletedFile ? (
              <Icon
                size="md"
                name={row.getIsExpanded() ? 'chevronDown' : 'chevronRight'}
                variant="solid"
                className="flex-none"
              />
            ) : null}
            <span>{headName}</span>
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
    columnHelper.accessor('baseCoverage.coverage', {
      id: 'change',
      header: 'Change',
      cell: ({ row }) => {
        const headCoverage = row.original?.headCoverage?.coverage
        const baseCoverage = row.original?.baseCoverage?.coverage
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

function RenderSubComponent({ row }: { row: Row<ImpactedFileType> }) {
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
  const { provider, owner, repo, commit: commitSha } = useParams<URLParams>()
  const location = useLocation()

  const queryParams = qs.parse(location.search, {
    ignoreQueryPrefix: true,
    depth: 1,
  })

  const flags = isArray(queryParams?.flags) ? queryParams?.flags : null
  const components = isArray(queryParams?.components)
    ? queryParams?.components
    : null

  const { data: commitData, isLoading } = useCommit({
    provider,
    owner,
    repo,
    commitid: commitSha,
    filters: {
      ...(flags ? { flags } : {}),
      ...(components ? { components } : {}),
      hasUnintendedChanges: true,
    },
  })

  const data = useMemo(() => {
    if (
      commitData?.commit?.compareWithParent?.__typename === 'Comparison' &&
      commitData?.commit?.compareWithParent?.impactedFiles?.__typename ===
        'ImpactedFiles'
    ) {
      return commitData?.commit?.compareWithParent?.impactedFiles?.results ?? []
    }
    return []
  }, [commitData?.commit?.compareWithParent])

  const table = useReactTable({
    columns: getColumns(),
    data,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original?.headCoverage !== null, // deleted files are not expandable
  })

  if (commitData?.commit?.state === 'pending') {
    return <Loader />
  }

  if (
    isEmpty(data) &&
    (flags ||
      components ||
      (commitData?.commit?.compareWithParent?.__typename === 'Comparison' &&
        commitData?.commit?.compareWithParent?.impactedFiles?.__typename ===
          'UnknownFlags'))
  ) {
    return (
      <>
        <ToggleHeader />
        <p className="m-4">
          No files covered by tests and selected flags and/or components were
          changed
        </p>
      </>
    )
  }

  if (isEmpty(data) && !isLoading) {
    return <p className="m-4">No files covered by tests were changed</p>
  }

  return (
    <>
      <ToggleHeader />
      <div className="filelistui">
        <div>
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className="filelistui-thead">
              {headerGroup.headers.map((header) => {
                return (
                  <div
                    key={header.id}
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse justify-end w-8/12':
                        header.id === 'name',
                      'justify-end': header.id !== 'name',
                      'w-3/12': header.id === 'change',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          {isLoading ? (
            <Loader />
          ) : (
            table.getRowModel().rows.map((row, i) => {
              const isDeletedFile = row.original?.headCoverage === null
              return (
                <Fragment key={i}>
                  <div
                    className={cs('filelistui-row', {
                      'cursor-pointer': !isDeletedFile,
                      'cursor-default': isDeletedFile,
                    })}
                    data-testid="file-diff-expand"
                    onClick={() => !isDeletedFile && row.toggleExpanded()}
                    data-highlight-row={!isDeletedFile ? 'onHover' : undefined}
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
                            'w-8/12': cell.column.id === 'name',
                            'flex justify-end': cell.column.id !== 'name',
                            'w-3/12': cell.column.id === 'change',
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
                    {row.getIsExpanded() ? (
                      <RenderSubComponent row={row} />
                    ) : null}
                  </div>
                </Fragment>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
