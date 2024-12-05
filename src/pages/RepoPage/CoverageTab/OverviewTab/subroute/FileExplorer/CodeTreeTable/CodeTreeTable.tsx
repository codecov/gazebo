import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { OrderingDirection } from 'services/repos'
import { useTableDefaultSort } from 'shared/ContentsTable/useTableDefaultSort'
import { Row } from 'shared/ContentsTable/utils'
import Icon from 'ui/Icon'

import { useRepoBranchContentsTable } from '../hooks'
import { Loader, RepoContentsResult } from '../shared'

const columnHelper = createColumnHelper<Row>()

function LoadMoreTrigger({ intersectionRef }: { intersectionRef: any }) {
  return (
    <span
      ref={intersectionRef}
      className="invisible relative top-[-65px] block leading-[0]"
    >
      Loading
    </span>
  )
}

function getOrderingDirection(sorting: Array<{ id: string; desc: boolean }>) {
  const state = sorting[0]

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

type ColumnType = (typeof baseColumns)[number]

function CodeTreeTable() {
  const [sorting, setSorting] = useTableDefaultSort()
  const ordering = getOrderingDirection(sorting)
  const { ref, inView } = useInView()
  const {
    data,
    isSearching,
    isMissingHeadReport,
    isLoading,
    hasFlagsSelected,
    hasComponentsSelected,
    pathContentsType,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepoBranchContentsTable(ordering)

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, inView, hasNextPage])

  const table = useReactTable({
    columns: baseColumns,
    getCoreRowModel: getCoreRowModel(),
    data,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    manualSorting: true,
  })

  const subtotalRow = (column: ColumnType) => {
    const columnId = column.id as keyof Row

    if (columnId === 'name') {
      return <p className="pl-1">Subtotal</p>
    }

    const columnsToSum = ['lines', 'hits', 'partials', 'misses']

    if (columnsToSum.includes(columnId)) {
      return calculateColumnTotal(columnId)
    }

    return null
  }

  const calculateColumnTotal = (columnId: keyof Row) => {
    const total = data.reduce((sum, row) => {
      const value = row[columnId]
      const numericValue =
        typeof value === 'string' ? parseInt(value, 10) || 0 : 0
      return sum + numericValue
    }, 0)

    return total
  }

  if (data?.length === 0 && !isLoading) {
    return (
      <RepoContentsResult
        isSearching={isSearching}
        isMissingHeadReport={isMissingHeadReport}
        hasFlagsSelected={hasFlagsSelected}
        hasComponentsSelected={hasComponentsSelected}
        isMissingCoverage={pathContentsType === 'MissingCoverage'}
        isUnknownPath={pathContentsType === 'UnknownPath'}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
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
              <>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-ds-gray-primary">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cs({
                          'w-2/12': cell.column.id === 'percentCovered',
                          'text-right w-1/12': cell.column.id !== 'name',
                          'w-4/12': cell.column.id === 'name',
                        })}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.length >= 2 && (
                  <tr className="bg-ds-gray-secondary">
                    {baseColumns.map((column) => (
                      <td
                        key={column.id}
                        className={cs({
                          'text-right w-1/12': column.id !== 'name',
                          'w-4/12 ml-6': column.id === 'name',
                        })}
                      >
                        {subtotalRow(column)}
                      </td>
                    ))}
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      <Loader isLoading={isLoading || isFetchingNextPage} />
      {hasNextPage ? <LoadMoreTrigger intersectionRef={ref} /> : null}
    </div>
  )
}

export default CodeTreeTable
