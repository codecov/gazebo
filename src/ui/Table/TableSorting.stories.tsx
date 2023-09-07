import type { Meta, StoryObj } from '@storybook/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import cs from 'classnames'
import { useState } from 'react'

import Icon from '../Icon'

import './Table.css'

interface Person {
  name: string
  title: string
  email: string
  seatNumber: string
}

const people: Person[] = [
  {
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    email: 'lindsay.walton@example.com',
    seatNumber: '23',
  },
  {
    name: 'McGregory James',
    title: 'Back-end Developer',
    email: 'mcgregory@example.com',
    seatNumber: '3',
  },
  {
    name: 'Brian Davidson',
    title: 'Front-end Developer',
    email: 'brian.davidson@example.com',
    seatNumber: '17',
  },
]

const columnHelper = createColumnHelper<Person>()

function SortingExampleWithReactTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = [
    columnHelper.accessor('name', {
      header: () => 'Name',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('title', {
      header: () => 'Title',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('email', {
      header: () => 'Email',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('seatNumber', {
      header: () => 'Seat Number',
      cell: (info) => info.renderValue(),
    }),
  ]

  const table = useReactTable({
    data: people,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="tableui">
      <table>
        <caption>An example with sorting.</caption>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  scope="col"
                  className="group/columnheader"
                  data-sortable={header.column.getCanSort()}
                  {...{
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                  {...(header.id === 'seatNumber'
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                >
                  <div
                    className={cs('flex gap-1', {
                      // reverse the order of the icon and text so the text is aligned well when not active.
                      'flex-row-reverse': header.id === 'seatNumber',
                    })}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {/* Note for animations to work you must wrap th contents in a div, something to do with display type table cell disabling animations of children */}
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
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  {...(cell.column.id === 'seatNumber'
                    ? {
                        'data-type': 'numeric',
                      }
                    : {})}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const meta: Meta<typeof SortingExampleWithReactTable> = {
  title: 'Components/Table',
  component: SortingExampleWithReactTable,
}

export default meta
type Story = StoryObj<typeof SortingExampleWithReactTable>

export const SortingExample: Story = {
  render: () => <SortingExampleWithReactTable />,
}
