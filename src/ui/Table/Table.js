import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'

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

function Table({ data, columns, onSort }) {
  const _data = React.useMemo(() => data, [data])
  const _columns = React.useMemo(() => columns, [columns])
  const [sorting, setSorting] = useState([])

  const table = useReactTable({
    data: _data,
    columns: _columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
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

  return (
    <div className="text-ds-gray-quaternary overflow-x-auto">
      <table className="flex flex-col mx-4 sm:mx-0">
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
                          {...(!!onSort && {
                            className:
                              'flex flex-row grow gap-1 items-center cursor-pointer select-none',
                            onClick: header.column.getToggleSortingHandler(),
                          })}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
                        </div>
                      </th>
                    )
                  })
                }
              </tr>
            ))
          }
        </thead>
        {/* Apply the table body props */}
        <tbody data-testid="body-row">
          {
            // Loop over the table rows
            table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id} className={TableClasses.tableRow}>
                  {
                    // Loop over the rows cells
                    row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
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
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

Table.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  onSort: PropTypes.func,
}

export default Table
