import { render, screen } from '@testing-library/react'

import ManageAdminCard from './ManageAdminCard'
import { useUsers } from 'services/users'

jest.mock('services/users')
jest.mock('react-router-dom', () => ({
  useParams: () => ({
    provider: 'gh',
    owner: 'codecov',
  }),
}))

const admins = [
  { username: 'dorian', email: 'dorian@codecov.io', name: 'dorian' },
]

describe('ManageAdminCard', () => {
  function setup(adminResults = []) {
    useUsers.mockReturnValue({
      data: {
        results: adminResults,
      },
    })
    render(<ManageAdminCard />)
  }

  describe('when rendered when there are no admins', () => {
    beforeEach(() => {
      setup([])
    })

    it('renders an empty copy', () => {
      expect(
        screen.getByText(
          /No admins yet. Note that admins in your Github organization are automatically considered admins./
        )
      ).toBeInTheDocument()
    })
  })

  describe('when rendered when there are no admins and its not a list', () => {
    beforeEach(() => {
      setup(null)
    })

    it('renders an empty copy', () => {
      expect(
        screen.getByText(
          /No admins yet. Note that admins in your Github organization are automatically considered admins./
        )
      ).toBeInTheDocument()
    })
  })

  describe('when rendered with admins', () => {
    beforeEach(() => {
      setup(admins)
    })

    it('renders the admins', () => {
      expect(screen.getAllByText(admins[0].name)).not.toHaveLength(0)
      expect(screen.getAllByText(admins[0].username)).not.toHaveLength(0)
      expect(screen.getAllByText(admins[0].email)).not.toHaveLength(0)
    })
  })
})
