import type { Meta, StoryObj } from '@storybook/react'

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
  // More people...
]
function Example() {
  return (
    <div className="tableui">
      <table>
        <caption>A basic html example.</caption>
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
              <td>{person.name}</td>
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

const meta: Meta<typeof Example> = {
  title: 'Components/Table',
  component: Example,
}

export default meta
type Story = StoryObj<typeof Example>

export const BasicExample: Story = {
  render: () => <Example />,
}
