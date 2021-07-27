import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { useAccountDetails } from 'services/account'
import { useOwner } from 'services/user'
import RequestButton from './RequestButton'

jest.mock('services/account')
jest.mock('services/user')

let container

describe('RequestButton', () => {
  function setup(owner, accountDetails) {
    useOwner.mockReturnValue({
      data: owner,
    })
    useAccountDetails.mockReturnValue({
      data: accountDetails,
    })(
      ({ container } = render(
        <MemoryRouter initialEntries={['/gh/codecov']}>
          <Route path="/:provider/:owner">
            <RequestButton owner="someUser" provider="gh" />
          </Route>
        </MemoryRouter>
      ))
    )
  }

  describe('when the owner is not part of the org', () => {
    beforeEach(() => {
      setup(
        {
          isCurrentUserPartOfOrg: false,
          username: 'codecov',
        },
        {
          undefined,
        }
      )
    })

    it('does not render the request button', () => {
      expect(screen.queryByText(/Request Button/)).toBeNull()
    })

    it('renders null when there isnt data', () => {
      expect(container.firstChild).toBeNull()
    })
  })

  describe('when the owner is part of the org', () => {
    it('renders request demo button if org has a free plan', () => {
      setup(
        {
          isCurrentUserPartOfOrg: true,
          username: 'codecov',
        },
        {
          plan: {
            value: 'users-free',
          },
        }
      )

      const requestDemoButton = screen.getByTestId('request-demo')
      expect(requestDemoButton).toBeInTheDocument()
      expect(requestDemoButton).toHaveAttribute(
        'href',
        'https://about.codecov.io/demo'
      )
    })

    it('does not render request demo button when owner without free plan is logged in', () => {
      setup(
        {
          isCurrentUserPartOfOrg: true,
          username: 'codecov',
        },
        {
          plan: {
            value: 'not-users-free',
          },
        }
      )
      expect(screen.queryByText(/Request demo/)).toBeNull()
    })
  })
})
