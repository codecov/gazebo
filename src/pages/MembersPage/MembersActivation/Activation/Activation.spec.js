import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAccountDetails } from 'services'

import Activation from './Activation'

jest.mock('services')

const queryClient = new QueryClient()

const mockAccountDetailsResponse = {
  data: {
    activatedUserCount: 5,
    plan: {
      quantity: 9,
    },
  },
}

describe('Members Activation', () => {
  function setup() {
    useAccountDetails.mockReturnValue(mockAccountDetailsResponse)
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/members/gh/critical-role']}>
          <Route path="/:provider/:owner/:repo">
            <Activation />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('Renders Component', () => {
    beforeEach(() => {
      setup()
    })

    if (
      ('Displays title',
      () => {
        expect(screen.getByText(/Member activation/)).toBeInTheDocument()
      })
    )
      it('Displays number of activated users', () => {
        expect(screen.getByText(/active members of/)).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument()
      })

    it('Displays number of plan quantity', () => {
      expect(screen.getByText('9')).toBeInTheDocument()
      expect(screen.getByText(/available seats/)).toBeInTheDocument()
    })

    it('Renders change plan link', () => {
      const link = screen.getByRole('link', {
        href: '/account/bb/critical-role/billing/upgrade',
      })
      expect(link).toBeInTheDocument()
    })
  })
})
