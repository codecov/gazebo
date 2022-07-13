import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from 'react-query'
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
        const usersNumber = screen.getByText('5')
        const p = screen.getByText(/active members of/)
        expect(p).toBeInTheDocument()
        expect(usersNumber).toBeInTheDocument()
      })

    it('Displays number of plan quantity', () => {
      const p = screen.getByText(/avaialbe seats/)
      const planQuantity = screen.getByText('9')
      expect(planQuantity).toBeInTheDocument()
      expect(p).toBeInTheDocument()
    })

    it('Renders change plan link', () => {
      const link = screen.getByRole('link', {
        href: '/account/bb/critical-role/billing/upgrade',
      })
      expect(link).toBeInTheDocument()
    })
  })
})
