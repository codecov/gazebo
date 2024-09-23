import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Route } from 'react-router-dom'
import { MemoryRouter } from 'react-router-dom/cjs/react-router-dom.min'

import ActivationBanner from './ActivationBanner'

const mockSeatData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const mockUserData = {
  activated: false,
  email: 'codecov-user@codecov.io',
  isAdmin: true,
  name: 'Codecov User',
  ownerid: 1,
  username: 'codecov-user',
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('ActivationBanner', () => {
  function setup(
    { overrideUserData = {}, overrideSeatData = {} } = {
      overrideUserData: {},
      overrideSeatData: {},
    }
  ) {
    const user = userEvent.setup()

    let restUsersCurrent = { ...mockUserData, ...overrideUserData }
    const querySeats = { ...mockSeatData, ...overrideSeatData }

    server.use(
      http.get('/internal/users/current', (info) => {
        return HttpResponse.json(restUsersCurrent)
      }),
      graphql.query('Seats', (info) => {
        return HttpResponse.json({ data: querySeats })
      }),
      http.patch('/internal/users/current', async (info) => {
        const { activated } = await info.request.json()

        restUsersCurrent = {
          ...mockUserData,
          activated,
        }

        return HttpResponse.json({})
      })
    )

    return { user }
  }

  describe('rendering banner header', () => {
    beforeEach(() => setup())

    it('renders header content', async () => {
      render(<ActivationBanner />, { wrapper })

      const heading = await screen.findByText('Activation Status')
      expect(heading).toBeInTheDocument()
    })
  })

  describe('rendering banner content', () => {
    describe('user is activated', () => {
      beforeEach(() => setup({ overrideUserData: { activated: true } }))

      it('displays user is activated', async () => {
        render(<ActivationBanner />, { wrapper })

        const activated = await screen.findByText('You are currently activated')
        expect(activated).toBeInTheDocument()
      })
    })

    describe('user is not activated', () => {
      describe('org has free seats', () => {
        beforeEach(() => setup({ overrideSeatData: { activated: false } }))

        it('displays user is not activated', async () => {
          render(<ActivationBanner />, { wrapper })

          const activated = await screen.findByText(
            'You are currently not activated'
          )
          expect(activated).toBeInTheDocument()
        })
      })

      describe('org does not have free seats', () => {
        beforeEach(() =>
          setup({
            overrideSeatData: { seatsUsed: 10, seatsLimit: 10 },
            overrideUserData: { activated: false },
          })
        )

        it('displays org out of seat message', async () => {
          render(<ActivationBanner />, { wrapper })

          const noSeatMsg = await screen.findByText(
            /unable to activate because there are no available seats/
          )
          expect(noSeatMsg).toBeInTheDocument()
        })

        it('sets toggle to disabled', async () => {
          render(<ActivationBanner />, { wrapper })

          const button = await screen.findByRole('button')
          expect(button).toHaveClass('cursor-not-allowed')
        })
      })
    })
  })

  describe('updating users activation', () => {
    describe('user activates their account', () => {
      it('updates their activation status', async () => {
        const { user } = setup({ overrideUserData: { activated: false } })
        render(<ActivationBanner />, { wrapper })

        const notActivated = await screen.findByText(
          'You are currently not activated'
        )
        expect(notActivated).toBeInTheDocument()

        const toggle = await screen.findByTestId('switch')
        await user.click(toggle)

        const activated = await screen.findByText('You are currently activated')
        expect(activated).toBeInTheDocument()
      })
    })

    describe('user deactivates their account', () => {
      it('updates their activation status', async () => {
        const { user } = setup({ overrideUserData: { activated: true } })
        render(<ActivationBanner />, { wrapper })

        const activated = await screen.findByText('You are currently activated')
        expect(activated).toBeInTheDocument()

        const toggle = await screen.findByTestId('switch')
        await user.click(toggle)

        const notActivated = await screen.findByText(
          'You are currently not activated'
        )
        expect(notActivated).toBeInTheDocument()
      })
    })
  })
})
