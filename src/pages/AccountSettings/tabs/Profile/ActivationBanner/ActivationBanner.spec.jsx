import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Route } from 'react-router-dom'
import { MemoryRouter } from 'react-router-dom/cjs/react-router-dom.min'

import ActivationBanner from './ActivationBanner'

const mockSeatData = {
  config: {
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

let mockUserData = {
  activated: false,
  email: 'codecov-user@codecov.io',
  isAdmin: true,
  name: 'Codecov User',
  ownerid: 1,
  username: 'codecov-user',
}

const queryClient = new QueryClient()
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

describe('ActivationBanner', () => {
  describe('rendering banner header', () => {
    beforeEach(() => {
      server.use(
        rest.get('/internal/users/current', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ ...mockUserData }))
        }),
        graphql.query('Seats', (req, res, ctx) => {
          return res(ctx.status(200), ctx.data({ ...mockSeatData }))
        })
      )
    })

    it('renders header content', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/gh']}>
            <Route path="/:provider">
              <ActivationBanner />
            </Route>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const heading = await screen.findByText('Activation Status')
      expect(heading).toBeInTheDocument()
    })
  })

  describe('rendering banner content', () => {
    describe('user is activated', () => {
      beforeEach(() => {
        server.use(
          rest.get('/internal/users/current', (req, res, ctx) =>
            res(ctx.status(200), ctx.json({ ...mockUserData, activated: true }))
          ),
          graphql.query('Seats', (req, res, ctx) =>
            res(ctx.status(200), ctx.data({ ...mockSeatData }))
          )
        )
      })

      it('displays user is activated', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <ActivationBanner />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const activated = await screen.findByText('You are currently activated')
        expect(activated).toBeInTheDocument()
      })
    })

    describe('user is not activated', () => {
      describe('org has free seats', () => {
        beforeEach(() => {
          server.use(
            rest.get('/internal/users/current', (req, res, ctx) =>
              res(
                ctx.status(200),
                ctx.json({ ...mockUserData, activated: false })
              )
            ),
            graphql.query('Seats', (req, res, ctx) =>
              res(ctx.status(200), ctx.data({ ...mockSeatData }))
            )
          )
        })

        it('displays user is not activated', async () => {
          render(
            <QueryClientProvider client={queryClient}>
              <MemoryRouter initialEntries={['/gh']}>
                <Route path="/:provider">
                  <ActivationBanner />
                </Route>
              </MemoryRouter>
            </QueryClientProvider>
          )

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const activated = await screen.findByText(
            'You are currently not activated'
          )
          expect(activated).toBeInTheDocument()
        })
      })

      describe('org does not have free seats', () => {
        beforeEach(() => {
          server.use(
            rest.get('/internal/users/current', (req, res, ctx) =>
              res(
                ctx.status(200),
                ctx.json({ ...mockUserData, activated: false })
              )
            ),
            graphql.query('Seats', (req, res, ctx) =>
              res(
                ctx.status(200),
                ctx.data({ config: { seatsUsed: 5, seatsLimit: 5 } })
              )
            )
          )
        })

        it('displays org out of seat message', async () => {
          render(
            <QueryClientProvider client={queryClient}>
              <MemoryRouter initialEntries={['/gh']}>
                <Route path="/:provider">
                  <ActivationBanner />
                </Route>
              </MemoryRouter>
            </QueryClientProvider>
          )

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const noSeatMsg = await screen.findByText(
            /unable to activate because there are no available seats/
          )
          expect(noSeatMsg).toBeInTheDocument()
        })
      })
    })
  })

  describe('updating users activation', () => {
    describe('user activates their account', () => {
      beforeEach(() => {
        mockUserData = { ...mockUserData, activated: false }
        server.use(
          rest.get('/internal/users/current', (req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockUserData))
          ),
          graphql.query('Seats', (req, res, ctx) =>
            res(ctx.status(200), ctx.data({ ...mockSeatData }))
          ),
          rest.patch('/internal/users/current', (req, res, ctx) => {
            const { body } = req
            mockUserData = { ...mockUserData, activated: body.activated }
            return res(ctx.status(200))
          })
        )
      })

      it('updates their activation status', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <ActivationBanner />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const notActivated = await screen.findByText(
          'You are currently not activated'
        )
        expect(notActivated).toBeInTheDocument()

        const toggle = await screen.findByTestId('switch')
        await userEvent.click(toggle)

        await waitFor(() => queryClient.isMutating)
        await waitFor(() => !queryClient.isMutating)
        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const activated = await screen.findByText('You are currently activated')
        expect(activated).toBeInTheDocument()
      })
    })

    describe('user deactivates their account', () => {
      beforeEach(() => {
        mockUserData = { ...mockUserData, activated: true }
        server.use(
          rest.get('/internal/users/current', (req, res, ctx) =>
            res(ctx.status(200), ctx.json(mockUserData))
          ),
          graphql.query('Seats', (req, res, ctx) =>
            res(ctx.status(200), ctx.data({ ...mockSeatData }))
          ),
          rest.patch('/internal/users/current', (req, res, ctx) => {
            const { body } = req
            mockUserData = { ...mockUserData, activated: body.activated }
            return res(ctx.status(200))
          })
        )
      })

      it('updates their activation status', async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/gh']}>
              <Route path="/:provider">
                <ActivationBanner />
              </Route>
            </MemoryRouter>
          </QueryClientProvider>
        )

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const activated = await screen.findByText('You are currently activated')
        expect(activated).toBeInTheDocument()

        const toggle = await screen.findByTestId('switch')
        await userEvent.click(toggle)

        await waitFor(() => queryClient.isMutating)
        await waitFor(() => !queryClient.isMutating)
        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const notActivated = await screen.findByText(
          'You are currently not activated'
        )
        expect(notActivated).toBeInTheDocument()
      })
    })
  })
})
