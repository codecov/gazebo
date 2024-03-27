import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { useState } from 'react'

import { OrderingDirection } from 'services/repos'
import { Row } from 'shared/ContentsTable/utils'
import Icon from 'ui/Icon'

import { useRepoBranchContentsTable } from '../hooks'
import { Loader, RepoContentsResult } from '../shared'

const columnHelper = createColumnHelper<Row>()

function getOrderingDirection(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting.at(0)

  if (state) {
    const direction = state?.desc
      ? OrderingDirection.DESC
      : OrderingDirection.ASC
    let ordering = undefined
    if (state.id === 'name') {
      ordering = 'NAME'
    }

    if (state.id === 'percentCovered') {
      ordering = 'COVERAGE'
    }

    if (state.id === 'hits') {
      ordering = 'HITS'
    }

    if (state.id === 'misses') {
      ordering = 'MISSES'
    }

    if (state.id === 'partials') {
      ordering = 'PARTIALS'
    }

    if (state.id === 'lines') {
      ordering = 'LINES'
    }

    return { direction, ordering }
  }

  return undefined
}

export const getBaseColumns = () => {
  const baseColumns = [
    columnHelper.accessor('name', {
      id: 'name',
      header: () => 'Files',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('lines', {
      id: 'lines',
      header: () => 'Tracked lines',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('hits', {
      id: 'hits',
      header: () => 'Covered',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('partials', {
      id: 'partials',
      header: () => 'Partial',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('misses', {
      id: 'misses',
      header: () => 'Missed',
      cell: ({ renderValue }) => renderValue(),
    }),
    columnHelper.accessor('coverage', {
      id: 'percentCovered',
      header: () => 'Coverage %',
      cell: ({ renderValue }) => renderValue(),
    }),
  ]

  return baseColumns
}

function CodeTreeTable() {
  const [sorting, setSorting] = useState([{ id: 'name', desc: false }])
  const ordering = getOrderingDirection(sorting)
  const {
    data,
    isSearching,
    isMissingHeadReport,
    isLoading,
    hasFlagsSelected,
    hasComponentsSelected,
    pathContentsType,
  } = useRepoBranchContentsTable(ordering)

  const table = useReactTable({
    columns: getBaseColumns(),
    getCoreRowModel: getCoreRowModel(),
    data: data ?? [],
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    manualSorting: true,
  })

  if (pathContentsType === 'UnknownPath') {
    return (
      <p className="m-4">
        Unknown filepath. Please ensure that files/directories exist and are not
        empty.
      </p>
    )
  }

  if (pathContentsType === 'MissingCoverage') {
    return <p className="m-4">No coverage data available.</p>
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="tableui">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    scope="col"
                    data-sortable={header.column.getCanSort()}
                    {...{
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    <div
                      className={`flex gap-1 ${
                        header.id !== 'name' ? 'flex-row-reverse' : ''
                      }`}
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
                <td colSpan={table.getAllColumns().length}>
                  <Loader />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cs({
                        'flex justify-end': cell.column.id === 'coverage',
                        'text-right':
                          cell.column.id !== 'name' &&
                          cell.column.id !== 'coverage',
                        'w-5/12': cell.column.id === 'name',
                        'w-1/12':
                          cell.column.id !== 'name' &&
                          cell.column.id !== 'coverage',
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Loader isLoading={isLoading} />
      {data?.length === 0 && !isLoading ? (
        <RepoContentsResult
          isSearching={isSearching}
          isMissingHeadReport={isMissingHeadReport}
          hasFlagsSelected={hasFlagsSelected}
          hasComponentsSelected={hasComponentsSelected}
        />
      ) : null}
    </div>
  )
}

export default CodeTreeTable
