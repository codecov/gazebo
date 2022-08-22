import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import MembersActivation from './MembersActivation'

jest.mock('services/account/hooks')

const queryClient = new QueryClient()

describe('Members Activation', () => {
  function setup() {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={['/account/bb/critical-role/bells-hells/billing']}
        >
          <Route path="/:provider/:owner/:repo">
            <MembersActivation activatedUserCount={5} planQuantity={9} />
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
