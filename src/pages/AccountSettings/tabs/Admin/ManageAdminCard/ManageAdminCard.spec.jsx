import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUpdateUser, useUsers } from 'services/users'

import ManageAdminCard from './ManageAdminCard'

jest.mock('services/users')
jest.mock('./AddAdmins', () => () => 'AddAdmins')
jest.mock('react-router-dom', () => ({
  useParams: () => ({
    provider: 'gh',
    owner: 'codecov',
  }),
}))

describe('ManageAdminCard', () => {
  function setup(adminResults = []) {
    const user = userEvent.setup()
    const refetch = jest.fn()
    const mutate = jest.fn()
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

    return { refetch, mutate, user }
  }

  describe('when rendered when there are no admins', () => {
    beforeEach(() => setup([]))

    it('renders an empty copy', () => {
      render(<ManageAdminCard />)

      const noAdmins = screen.getByText(
        /No admins yet. Note that admins in your Github organization are automatically considered admins./
      )
      expect(noAdmins).toBeInTheDocument()
    })
  })

  describe('when rendered when there are no admins and its not a list', () => {
    beforeEach(() => setup(null))

    it('renders an empty copy', () => {
      render(<ManageAdminCard />)

      const noAdmins = screen.getByText(
        /No admins yet. Note that admins in your Github organization are automatically considered admins./
      )
      expect(noAdmins).toBeInTheDocument()
    })
  })

  describe('when rendered with admins', () => {
    it('renders the admins', () => {
      setup([{ username: 'spookyfun', email: 'c3@cr.io', name: 'laudna' }])
      render(<ManageAdminCard />)

      const name = screen.getByText('laudna')
      expect(name).toBeInTheDocument()
      const username = screen.getByText('@spookyfun')
      expect(username).toBeInTheDocument()
      const email = screen.getByText('c3@cr.io')
      expect(email).toBeInTheDocument()
    })
  })

  describe('when clicking on revoking admin', () => {
    it('calls the mutation with the user and is_admin=false', async () => {
      const { mutate, user } = setup([
        {
          username: 'laudna',
          email: 'c3@cr.io',
          name: 'laudna',
          ownerid: 'someid',
        },
      ])

      render(<ManageAdminCard />)

      const revokeButton = screen.getByRole('button', {
        name: /revoke/i,
      })
      await user.click(revokeButton)

      expect(mutate).toHaveBeenCalledWith({
        targetUserOwnerid: 'someid',
        is_admin: false,
      })
    })
  })
})
