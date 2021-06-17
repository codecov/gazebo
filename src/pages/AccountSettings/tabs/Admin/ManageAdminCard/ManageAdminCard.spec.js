import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ManageAdminCard from './ManageAdminCard'
import { useUsers, useUpdateUser } from 'services/users'

jest.mock('services/users')
jest.mock('./AddAdmins', () => () => 'AddAdmins')
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
  const refetch = jest.fn()
  const mutate = jest.fn()
  function setup(adminResults = []) {
    useUsers.mockReturnValue({
      data: {
        results: adminResults,
      },
      refetch,
    })
    useUpdateUser.mockReturnValue({
      isLoading: false,
      mutate,
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

  describe('when clicking on revoking admin', () => {
    beforeEach(() => {
      setup(admins)
      const revokeButton = screen.getByRole('button', {
        name: /revoke/i,
      })
      userEvent.click(revokeButton)
    })

    it('calls the mutation with the user and is_admin=false', () => {
      expect(mutate).toHaveBeenCalledWith({
        targetUserOwnerid: admins[0].ownerid,
        is_admin: false,
      })
    })
  })
})
