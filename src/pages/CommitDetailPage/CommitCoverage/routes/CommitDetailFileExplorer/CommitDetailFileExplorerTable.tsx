import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { ReactNode } from 'react'

import MissingFileData from 'shared/ContentsTable/MissingFileData'
import Icon from 'ui/Icon'
import Spinner from 'ui/Spinner'

import { useRepoCommitContentsTable } from './hooks'
interface FileExplorerColumn {
  name: ReactNode
  lines: string
  hits: string
  partials: string
  misses: string
  coverage: ReactNode
}

const columnHelper = createColumnHelper<FileExplorerColumn>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Files',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('lines', {
    header: 'Tracked lines',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('hits', {
    header: 'Covered',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('partials', {
    header: 'Partial',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('misses', {
    header: 'Missed',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('coverage', {
    header: 'Coverage %',
    cell: (info) => info.renderValue(),
  }),
]

function CommitDetailFileExplorerTable() {
  const {
    data,
    isSearching,
    isLoading,
    pathContentsType,
    sortBy,
    setSortBy,
    hasComponentsSelected,
    hasFlagsSelected,
  } = useRepoCommitContentsTable()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting: sortBy,
    },
    onSortingChange: setSortBy,
    manualSorting: true,
  })

  console.log('COMMIT DETAIL FILE EXPLORER TABLE')

  if (pathContentsType === 'UnknownPath') {
    return (
      <p className="flex flex-1 justify-center">
        Unknown filepath. Please ensure that files/directories exist and are not
        empty.
      </p>
    )
  }

  if (
    pathContentsType === 'MissingCoverage' ||
    pathContentsType === 'MissingHeadReport'
  ) {
    return (
      <p className="flex flex-1 justify-center">No coverage data available.</p>
    )
  }

  if (data?.length === 0 && !isLoading) {
    return (
      <MissingFileData
        isSearching={isSearching}
        hasFlagsSelected={hasFlagsSelected}
        hasComponentsSelected={hasComponentsSelected}
      />
    )
  }

  return (
    <div className="tableui">
      <table>
        <colgroup>
          <col className="w-full @sm/table:w-5/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-1/12" />
          <col className="@sm/table:w-3/12" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  data-sortable={header.column.getCanSort()}
                  {...{
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  <div
                    className={cs('flex gap-1 items-center', {
                      'flex-row-reverse': header.id !== 'name',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    <span
                      className="text-ds-blue-darker group-hover/columnheader:opacity-100"
                      data-sort-direction={header.column.getIsSorted()}
                    >
                      <Icon name="arrowUp" size="sm" />
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length}>
                <div className="mb-4 flex justify-center pt-4">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    <div
                      className={cs('flex', {
                        'flex-row-reverse': cell.column.id !== 'name',
                        'font-lato':
                          cell.column.id !== 'name' &&
                          cell.column.id !== 'coverage',
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default CommitDetailFileExplorerTable
