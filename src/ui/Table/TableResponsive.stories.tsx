import type { Meta, StoryObj } from '@storybook/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import cs from 'classnames'

import './Table.css'

interface Person {
  name: string
  title: string
  email: string
  githubHandle: string
}

const people: Person[] = [
  {
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    email: 'lindsay.walton@example.com',
    githubHandle: 'lindsay203',
  },
  {
    name: 'McGregory James',
    title: 'Back-end Developer',
    email: 'mcgregory@example.com',
    githubHandle: 'greggreg',
  },
  {
    name: 'Brian Davidson',
    title: 'Front-end Developer',
    email: 'brian.davidson@example.com',
    githubHandle: 'yoloswagens',
  },
]

const columnHelper = createColumnHelper<Person>()

/*
  This responsive table example renders different columns/row data depending on the available screen space.

  className hidden and @lg/table:table-cell are used to hide/show columns at different breakpoints.
*/
function ResponsiveExampleWithReactTable() {
  const columns = [
    columnHelper.accessor('name', {
      header: () => 'Name',
      cell: (info) => (
        <>
          {info.renderValue()}
          {/* Only show Title/Email data when rows are collapsed */}
          <dl className="font-normal @lg/table:hidden">
            <dt className="sr-only">Title</dt>
            <dd className="mt-1 truncate text-gray-700">
              {info.row.getValue('title')}
            </dd>
            <dt className="sr-only @lg/table:hidden">Email</dt>
            <dd className="mt-1 truncate @lg/table:hidden">
              {info.row.getValue('email')}
            </dd>
          </dl>
        </>
      ),
    }),
    columnHelper.accessor('title', {
      header: () => 'Title',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('email', {
      header: () => 'Email',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('githubHandle', {
      header: () => 'GitHub Handle',
      cell: (info) => '@' + info.renderValue(),
    }),
  ]

  const table = useReactTable({
    data: people,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="tableui">
      <table>
        <caption>An responsive example using container queries.</caption>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  scope="col"
                  className={cs({
                    'hidden @lg/table:table-cell':
                      header.id === 'title' || header.id === 'email',
                  })}
                >
                  {/* check the header.id to show/hide th */}
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
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
                  className={cs('text-sm', {
                    'w-full max-w-0 font-medium @md/table:w-auto @md/table:max-w-none':
                      cell.column.id === 'name',
                    'hidden @lg/table:table-cell':
                      cell.column.id === 'title' || cell.column.id === 'email',
                  })}
                >
                  {/* check the cell.column.id to show/hide td */}
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

const meta: Meta<typeof ResponsiveExampleWithReactTable> = {
  title: 'Components/Table',
  component: ResponsiveExampleWithReactTable,
}

export default meta
type Story = StoryObj<typeof ResponsiveExampleWithReactTable>

export const ContainerQueryExample: Story = {
  render: () => <ResponsiveExampleWithReactTable />,
}
