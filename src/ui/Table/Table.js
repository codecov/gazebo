import cs from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useFlexLayout, useTable } from 'react-table'

const TableClasses = {
  headerCell: 'py-2 text-sm flex font-semibold px-3.5 text-ds-gray-quinary',
  headerRow: 'text-left border-t border-b border-ds-black-secondary',
  tableRow: 'border-t border-ds-black-secondary',
  tableCell:
    'py-3 items-center flex pr-2 sm:px-4 text-ds-gray-octonary text-sm',
}

function Table({ data = [], columns = [] }) {
  const _data = React.useMemo(() => data, [data])
  const _columns = React.useMemo(() => columns, [columns])
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns: _columns, data: _data }, useFlexLayout)

  const columnsWidth = columns.reduce(
    (acc, current) => ({ ...acc, [current.accessor]: current.width }),
    {}
  )

  return (
    <div className="text-ds-gray-quaternary overflow-x-auto">
      <table className="w-full mx-4 sm:mx-0" {...getTableProps()}>
        <thead data-testid="header-row">
          {
            // Loop over the header rows
            headerGroups.map((headerGroup, key) => (
              <tr
                key={key}
                className={TableClasses.headerRow}
                {...headerGroup.getHeaderGroupProps()}
              >
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column, key) => {
                    return (
                      <th
                        key={key}
                        className={cs(
                          TableClasses.headerCell,
                          columnsWidth[column.id]
                        )}
                        {...column.getHeaderProps()}
                      >
                        {column.render('Header')}
                      </th>
                    )
                  })
                }
              </tr>
            ))
          }
        </thead>
        {/* Apply the table body props */}
        <tbody data-testid="body-row" {...getTableBodyProps()}>
          {
            // Loop over the table rows
            rows.map((row, key) => {
              prepareRow(row)
              return (
                <tr
                  key={key}
                  className={TableClasses.tableRow}
                  {...row.getRowProps()}
                >
                  {
                    // Loop over the rows cells
                    row.cells.map((cell, key) => {
                      return (
                        <td
                          key={key}
                          className={cs(
                            TableClasses.tableCell,
                            columnsWidth[cell.column.id]
                          )}
                          {...cell.getCellProps()}
                        >
                          {cell.render('Cell')}
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
}

export default Table
