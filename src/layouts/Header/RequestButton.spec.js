import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { useAccountDetails } from 'services/account'
import RequestButton from './RequestButton'

jest.mock('services/account')
jest.mock('services/user')

describe('RequestButton', () => {
  let container

  function setup(accountDetails, isError = false) {
    useAccountDetails.mockReturnValue({
      data: accountDetails,
      isError,
    })(
      ({ container } = render(
        <MemoryRouter initialEntries={['/gh/codecov']}>
          <Route path="/:provider/:owner">
            <RequestButton owner="beauregard" provider="gh" />
          </Route>
        </MemoryRouter>
      ))
    )
  }

  describe('when the owner is not part of the org', () => {
    beforeEach(() => {
      setup(null, true)
    })

    it('does not render the request button', () => {
      expect(screen.queryByText(/Request Button/)).toBeNull()
    })

    it('renders null when there isnt data', () => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the owner is part of the org', () => {
    it('renders request demo button if org has a free plan', () => {
      setup({
        plan: {
          value: 'users-free',
        },
      })

      const requestDemoButton = screen.getByTestId('request-demo')
      expect(requestDemoButton).toBeInTheDocument()
      expect(requestDemoButton).toHaveAttribute(
        'href',
        'https://about.codecov.io/demo'
      )
    })

    it('does not render request demo button when owner without free plan is logged in', () => {
      setup({
        plan: {
          value: 'not-users-free',
        },
      })
      expect(screen.queryByText(/Request demo/)).toBeNull()
    })
  })
})
