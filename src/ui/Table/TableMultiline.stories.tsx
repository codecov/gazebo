import type { Meta, StoryObj } from '@storybook/react'

import './Table.css'

interface Person {
  comment: string
  date: string
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
    comment: 'This is a comment',
    date: '2021-01-01',
  },
  {
    name: 'McGregory James',
    title: 'Back-end Developer',
    email: 'mcgregory@example.com',
    seatNumber: '3',
    comment: 'This is another comment',
    date: '2021-06-31',
  },
  // More people...
]
function MultiLineExample() {
  return (
    <div className="tableui">
      <table>
        <caption>A basic multiline html example.</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Title</th>
            <th scope="col">Email</th>
            <th scope="col" data-type="numeric">
              Seat Number
            </th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.email}>
              <td>
                <div className="flex flex-col">
                  <span>{person.comment}</span>
                  <span className="text-sm">
                    <span className="font-semibold text-ds-gray-octonary">
                      {person.name}
                    </span>{' '}
                    {person.date}
                  </span>
                </div>
              </td>
              <td>{person.title}</td>
              <td>{person.email}</td>
              <td data-type="numeric">{person.seatNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const meta: Meta<typeof MultiLineExample> = {
  title: 'Components/Table',
  component: MultiLineExample,
}

export default meta
type Story = StoryObj<typeof MultiLineExample>

export const BasicMultiLineExample: Story = {
  render: () => <MultiLineExample />,
}
