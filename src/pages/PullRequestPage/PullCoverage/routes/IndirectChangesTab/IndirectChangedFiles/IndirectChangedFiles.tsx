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

import A from 'ui/A'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'
import 'ui/FileList/FileList.css'
import TotalsNumber from 'ui/TotalsNumber'

import { useIndirectChangedFilesTable } from './hooks'
import NameColumn from './NameColumn/NameColumn'

import FileDiff from '../FileDiff'


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
          <div className="flex cursor-pointer items-center gap-2">
            <NameColumn row={row} getValue={() => ''}></NameColumn>
            <div className="flex flex-col break-all">
              <A
                hook={undefined}
                isExternal={false}
                to={{
                  pageName: 'pullFileView',
                  options: { pullId: row.original.pullId, tree: getValue() },
                }}
              >
                {getValue()}
              </A>
            </div>
            {row.original.isCriticalFile && (
              <span className="self-center rounded border border-ds-gray-tertiary p-1 text-xs text-ds-gray-senary">
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
      <FileDiff path={nameColumn} />
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
    getRowCanExpand: () => true,
  })

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
                  className={cs('flex gap-1 items-center', {
                    'flex-row-reverse justify-end w-6/12': header.id === 'name',
                    'justify-end w-2/12': header.id !== 'name',
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
                        'w-6/12': cell.column.id === 'name',
                        'flex justify-end w-2/12': cell.column.id !== 'name',
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
