import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import { uniqueId } from 'lodash/util'
import PropTypes from 'prop-types'
import React, { Fragment, memo, useEffect, useState } from 'react'

import Icon from 'ui/Icon'

const TableClasses = {
  headerCell:
    'py-2 text-sm flex font-semibold px-3.5 text-ds-gray-quinary gap-1 items-center',
  headerRow:
    'flex flex-row text-left border-t border-b border-ds-black-secondary',
  tableRow: 'flex flex-row border-t border-ds-black-secondary',
  tableCell:
    'py-3 items-center flex pr-2 sm:px-4 text-ds-gray-octonary text-sm',
}

function _renderHead({ table, columnsWidth, onSort, colJustifyStart }) {
  return (
    <thead data-testid="header-row">
      {
        // Loop over the header rows
        table.getHeaderGroups().map((headerGroup, key) => (
          <tr key={key} className={TableClasses.headerRow}>
            {
              // Loop over the headers in each row
              headerGroup.headers.map((header, key) => {
                return (
                  <th
                    key={key}
                    className={cs(
                      TableClasses.headerCell,
                      columnsWidth[header.id]
                    )}
                  >
                    <div
                      className={cs('flex flex-row grow', {
                        'gap-1 items-center cursor-pointer select-none':
                          !!onSort,
                        'justify-start': colJustifyStart[header.id],
                        'justify-end': !colJustifyStart[header.id],
                      })}
                      {...(!!onSort && {
                        onClick: header.column.getToggleSortingHandler(),
                      })}
                    >
                      {header.column.getIsSorted() && (
                        <span className="text-ds-blue-darker">
                          {
                            {
                              asc: <Icon name="arrow-up" size="sm" />,
                              desc: <Icon name="arrow-down" size="sm" />,
                            }[header.column.getIsSorted()]
                          }
                        </span>
                      )}
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  </th>
                )
              })
            }
          </tr>
        ))
      }
    </thead>
  )
}

function _renderBody({ table, columnsWidth, renderSubComponent }) {
  // Apply the table body props
  return (
    <tbody data-testid="body-row">
      {
        // Loop over the table rows
        table.getRowModel().rows.map((row) => {
          return (
            <Fragment key={uniqueId(`row_${row.id}_`)}>
              <tr className={TableClasses.tableRow}>
                {
                  // Loop over the rows cells
                  row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={uniqueId(`cell_${cell.id}_`)}
                        className={cs(
                          TableClasses.tableCell,
                          columnsWidth[cell.column.columnDef.accessorKey]
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })
                }
              </tr>
              {/* TODO: add getCanExpand() condition here when tanstack table is updated at least to 8.5.13  */}
              {row.getIsExpanded() && renderSubComponent({ row })}
            </Fragment>
          )
        })
      }
    </tbody>
  )
}

/*
 * TODO: the table component needs to be reworked to have the ability to embed any type of markup inside of it.
 * Anything that doesn't follow the table syntax will lead to an accessibility error, e.g. compare page impacted files table
 */
const Table = memo(function ({
  data,
  columns,
  onSort,
  defaultSort = [],
  renderSubComponent = null,
}) {
  const _data = React.useMemo(() => data, [data])
  const _columns = React.useMemo(() => columns, [columns])
  const [sorting, setSorting] = useState(defaultSort)

  const table = useReactTable({
    data: _data,
    columns: _columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  useEffect(() => {
    if (!!onSort) {
      onSort(sorting)
    }
  }, [onSort, sorting])

  const columnsWidth = columns.reduce(
    (acc, current) => ({ ...acc, [current.accessorKey]: current.width }),
    {}
  )

  const colJustifyStart = columns.reduce(
    (acc, current) => ({
      ...acc,
      [current.accessorKey]: current.justifyStart,
    }),
    {}
  )

  return (
    <div className="overflow-x-auto">
      <table className="flex flex-col mx-4 sm:mx-0">
        {_renderHead({ table, columnsWidth, onSort, colJustifyStart })}
        {_renderBody({ table, columnsWidth, renderSubComponent })}
      </table>
    </div>
  )
})

Table.displayName = 'Table'

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onSort: PropTypes.func,
  renderSubComponent: PropTypes.func,
  defaultSort: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      desc: PropTypes.bool,
    })
  ),
}

export default Table
