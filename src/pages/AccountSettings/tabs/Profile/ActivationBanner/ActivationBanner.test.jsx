import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

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

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('ActivationBanner', () => {
  function setup(
    { overrideUserData = {}, overrideSeatData = {} } = {
      overrideUserData: {},
      overrideSeatData: {},
    }
  ) {
    const user = userEvent.setup()

    let restUsersCurrent = { ...mockUserData, ...overrideUserData }
    const querySeats = { ...mockSeatData.config, ...overrideSeatData }

    server.use(
      http.get('/internal/users/current', () => {
        return HttpResponse.json(restUsersCurrent)
      }),
      graphql.query('Seats', () => {
        return HttpResponse.json({ data: { config: querySeats } })
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
    it('renders header content', async () => {
      setup()
      render(<ActivationBanner />, { wrapper })

      const heading = await screen.findByText('Activation Status')
      expect(heading).toBeInTheDocument()
    })
  })

  describe('rendering banner content', () => {
    describe('user is activated', () => {
      it('displays user is activated', async () => {
        setup({ overrideUserData: { activated: true } })
        render(<ActivationBanner />, { wrapper })

        const activated = await screen.findByText('You are currently activated')
        expect(activated).toBeInTheDocument()
      })
    })

    describe('user is not activated', () => {
      describe('org has free seats', () => {
        it('displays user is not activated', async () => {
          setup({ overrideSeatData: { activated: false } })
          render(<ActivationBanner />, { wrapper })

          const activated = await screen.findByText(
            'You are currently not activated'
          )
          expect(activated).toBeInTheDocument()
        })
      })

      describe('org does not have free seats', () => {
        it('displays org out of seat message', async () => {
          setup({
            overrideSeatData: { seatsUsed: 10, seatsLimit: 10 },
            overrideUserData: { activated: false },
          })
          render(<ActivationBanner />, { wrapper })

          const noSeatMsg = await screen.findByText(
            /unable to activate because there are no available seats/
          )
          expect(noSeatMsg).toBeInTheDocument()
        })

        it('sets toggle to disabled', async () => {
          setup({
            overrideSeatData: { seatsUsed: 10, seatsLimit: 10 },
            overrideUserData: { activated: false },
          })
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
