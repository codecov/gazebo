import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { useAccountDetails } from 'services/account'
import { useOwner } from 'services/user'
import ButtonWrapper from './ButtonWrapper'
import RequestButton from './ButtonWrapper'

jest.mock('services/account')
jest.mock('services/user')

describe('ButtonWrapper', () => {
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
          <ButtonWrapper owner="someUser" provider="gh">
            <RequestButton owner="someUser" provider="gh" />
          </ButtonWrapper>
        </Route>
      </MemoryRouter>
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
