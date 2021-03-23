import PropTypes from 'prop-types'
import React from 'react'
import { useTable } from 'react-table'
import cs from 'classnames'

const TableClasses = {
  fullTable: 'w-full',
  headerCell: 'py-2 px-3.5',
  headerRow: 'text-left border-t border-b border-gray-300',
  tableRow: 'border-t border-b border-gray-300',
  tableCell: 'py-3 px-4',
}

function Table({ variant, data = [], columns = [] }) {
  const _data = React.useMemo(() => data, [data])
  const _columns = React.useMemo(() => columns, [columns])
  const tableInstance = useTable({ columns: _columns, data: _data })

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance

  return (
    // apply the table props
    <div className="flex">
      <table
        className={cs({ [TableClasses.fullTable]: variant === 'full' })}
        {...getTableProps()}
      >
        <thead data-testid="header-row">
          {
            // Loop over the header rows
            headerGroups.map((headerGroup, key) => (
              // Apply the header row props
              <tr
                key={key}
                className={TableClasses.headerRow}
                {...headerGroup.getHeaderGroupProps()}
              >
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((column, key) => (
                    // Apply the header cell props
                    <th
                      key={key}
                      className={TableClasses.headerCell}
                      {...column.getHeaderProps()}
                    >
                      {
                        // Render the header
                        column.render('Header')
                      }
                    </th>
                  ))
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
              // Prepare the row for display
              prepareRow(row)
              return (
                // Apply the row props
                <tr
                  key={key}
                  className={TableClasses.tableRow}
                  {...row.getRowProps()}
                >
                  {
                    // Loop over the rows cells
                    row.cells.map((cell, key) => {
                      // Apply the cell props
                      return (
                        <td
                          key={key}
                          className={TableClasses.tableCell}
                          {...cell.getCellProps()}
                        >
                          {
                            // Render the cell contents
                            cell.render('Cell')
                          }
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
  variant: PropTypes.oneOf(['full']),
  data: PropTypes.array,
  columns: PropTypes.array,
}

export default Table
