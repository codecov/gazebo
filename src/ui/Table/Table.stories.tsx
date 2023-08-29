import type { Meta, StoryObj } from '@storybook/react'

import Icon from '../Icon'
import './Table.css'

const people = [
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
  // More people...
]
function Example() {
  return (
    <div className="tableui" data-highlight-row="onHover" data-sortable="true">
      <table>
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-sm font-semibold @sm/table:pl-0"
            >
              Name
              <Icon name="arrowUp" size="sm" />
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-sm font-semibold @lg/table:table-cell"
            >
              Title
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-sm font-semibold @sm/table:table-cell"
            >
              Email
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-sm font-semibold"
              data-type="numeric"
            >
              Seat Number
            </th>
            <th
              scope="col"
              className="relative py-3.5 pl-3 pr-4 @sm/table:pr-0"
            >
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {people.map((person) => (
            <tr key={person.email}>
              <td className="w-full max-w-0 text-sm font-medium @sm/table:w-auto @sm/table:max-w-none">
                {person.name}
                <dl className="font-normal @lg/table:hidden">
                  <dt className="sr-only">Title</dt>
                  <dd className="mt-1 truncate text-gray-700">
                    {person.title}
                  </dd>
                  <dt className="sr-only @sm/table:hidden">Email</dt>
                  <dd className="mt-1 truncate @sm/table:hidden">
                    {person.email}
                  </dd>
                </dl>
              </td>
              <td className="hidden text-sm @lg/table:table-cell">
                {person.title}
              </td>
              <td className="hidden text-sm @sm/table:table-cell">
                {person.email}
              </td>
              <td className="text-sm" data-type="numeric">
                {person.seatNumber}
              </td>
              <td className="text-right text-sm font-medium">
                <a
                  href="#fake"
                  className="cursor-pointer font-sans text-ds-blue hover:underline focus:ring-2"
                >
                  Edit<span className="sr-only">, {person.name}</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const meta: Meta<typeof Example> = {
  title: 'Components/Table',
  component: Example,
}

export default meta
type Story = StoryObj<typeof Example>

export const PureImport: Story = {
  render: () => <Example />,
}

export const InsideFlex: Story = {
  render: () => (
    <div className="flex">
      <Example />
    </div>
  ),
}

export const InsideGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Example />
    </div>
  ),
}
