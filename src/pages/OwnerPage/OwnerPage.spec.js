import { render, screen } from '@testing-library/react'
import OwnerPage from './OwnerPage'
import { useAccountDetails } from 'services/account'
import { useOwner } from 'services/user'
import { MemoryRouter, Route } from 'react-router-dom'

jest.mock('./Header', () => () => 'Header')
jest.mock('services/user')
jest.mock('services/account')
jest.mock('shared/ListRepo', () => () => 'ListRepo')

describe('OwnerPage', () => {
  function setup(owner, accountDetails) {
    useOwner.mockReturnValue({
      data: owner,
    })
    useAccountDetails.mockReturnValue({
      data: accountDetails,
    })
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <OwnerPage />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when the owner exists', () => {
    beforeEach(() => {
      setup(
        {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        {
          activatedUserCount: 3,
        }
      )
    })

    it('renders the ListRepo', () => {
      expect(screen.getByText(/ListRepo/)).toBeInTheDocument()
    })

    it('renders the header', () => {
      expect(screen.getByText(/Header/)).toBeInTheDocument()
    })

    it('renders links to the settings', () => {
      expect(
        screen.queryByRole('link', {
          name: /settings/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when the owner doesnt exist', () => {
    beforeEach(() => {
      setup(null)
    })

    it('doesnt render the ListRepo', () => {
      expect(screen.queryByText(/ListRepo/)).not.toBeInTheDocument()
    })

    it('doesnt render the header', () => {
      expect(screen.queryByText(/Header/)).not.toBeInTheDocument()
    })

    it('renders a not found error page', () => {
      expect(
        screen.getByRole('heading', {
          name: /not found/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
        },
      })
    })

    it('doesnt render links to the settings', () => {
      expect(
        screen.queryByRole('link', {
          name: /settings/i,
        })
      ).not.toBeInTheDocument()
    })
  })
})
