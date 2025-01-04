import {
  createColumnHelper,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { Fragment, Suspense, useMemo, useState } from 'react'

import ToggleHeader from 'pages/PullRequestPage/Header/ToggleHeader/ToggleHeader'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import TotalsNumber from 'ui/TotalsNumber'

import { useIndirectChangedFilesTable } from './hooks'
import NameColumn from './NameColumn/NameColumn'

import PullFileDiff from '../PullFileDiff'

interface ImpactedFile {
  missesCount: number | undefined
  headCoverage?: number | null | undefined
  patchCoverage?: number | null | undefined
  changeCoverage?: number | null | undefined
  hasHeadOrPatchCoverage: boolean
  headName: string | null | undefined
  fileName: string | null | undefined
  isCriticalFile: boolean | undefined
  pullId: number | null
}

const columnHelper = createColumnHelper<ImpactedFile>()

const isNumericValue = (value: string) => value === 'head' || value === 'change'

function getColumns() {
  return [
    columnHelper.accessor('headName', {
      id: 'name',
      header: 'Name',
      cell: ({ getValue, row }) => {
        return (
          <div className="flex items-center gap-2">
            <NameColumn row={row} getValue={() => ''}></NameColumn>
            <div className="flex flex-col break-all">
              <span>{getValue()}</span>
            </div>
            {row.original.isCriticalFile ? (
              <span className="flex-none self-center rounded border border-ds-gray-tertiary p-1 text-xs text-ds-gray-senary">
                Critical file
              </span>
            ) : null}
          </div>
        )
      },
    }),
    columnHelper.accessor('missesCount', {
      id: 'missedLines',
      header: 'Missed lines',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('headCoverage', {
      id: 'head',
      header: 'HEAD %',
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
    columnHelper.accessor('changeCoverage', {
      id: 'change',
      header: 'Change',
      cell: ({ getValue, row }) => {
        return row.original.hasHeadOrPatchCoverage ? (
          <div className="flex w-full justify-end">
            <TotalsNumber
              value={getValue()}
              plain={false}
              light={false}
              showChange
              large={false}
            />
          </div>
        ) : (
          <span className="ml-4 text-sm text-ds-gray-quinary">No data</span>
        )
      },
    }),
  ]
}

function RenderSubComponent({ row }: { row: Row<ImpactedFile> }) {
  const nameColumn = row.original?.headName
  return (
    <Suspense fallback={<Loader />}>
      <PullFileDiff path={nameColumn} />
    </Suspense>
  )
}

const Loader = () => (
  <div className="mb-4 flex justify-center pt-4">
    <Spinner />
  </div>
)

export default function IndirectChangedFiles() {
  const [expanded, setExpanded] = useState<ExpandedState>({})
  const { data, isLoading, sorting, setSorting } =
    useIndirectChangedFilesTable()
  const impactedFiles = useMemo(() => {
    return data?.impactedFiles ?? []
  }, [data?.impactedFiles])

  const table = useReactTable({
    columns: getColumns(),
    data: impactedFiles,
    state: {
      expanded,
      sorting,
    },
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original?.headCoverage !== null, // deleted files are not expandable
  })

  return (
    <>
      <ToggleHeader />
      <div className="filelistui">
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
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse justify-end w-6/12':
                        header.id === 'name',
                      'justify-end w-2/12': header.id !== 'name',
                    })}
                  >
                    <span data-sort-direction={isSorted}>
                      <Icon name="arrowUp" size="sm" />
                    </span>
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
                    {...(!isDeletedFile && { 'data-highlight-row': 'onHover' })}
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
                            'flex justify-end w-2/12':
                              cell.column.id !== 'name',
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
