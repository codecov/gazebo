import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import HomePage from './HomePage'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('shared/ListRepo', () => () => 'ListRepo')
jest.mock('./Banners', () => () => 'Banners')

const user = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'photo',
  onboardingCompleted: false,
}

console.error = () => {}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

let testLocation
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider" exact>
        {children}
      </Route>
      <Route
        path="*"
        render={({ location }) => {
          testLocation = location
          return null
        }}
      />
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('HomePage', () => {
  function setup(
    { successfulUser = true, successfulMutation = true } = {
      successfulUser: true,
      successfulMutation: true,
    }
  ) {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        if (successfulUser) {
          return res(ctx.status(200), ctx.data({ me: { user } }))
        }
        return res(ctx.status(200), ctx.data())
      }),
      graphql.mutation('SendSentryToken', (req, res, ctx) => {
        if (!successfulMutation) {
          return res(
            ctx.status(200),
            ctx.data({
              saveSentryState: {
                error: {
                  __typename: 'ValidationError',
                  message: 'validation error',
                },
              },
            })
          )
        }

        return res(ctx.status(200), ctx.data({ saveSentryState: null }))
      })
    )
  }

  afterEach(() => jest.resetAllMocks())

  describe('when user is authenticated', () => {
    describe('when user does not have sentry token set', () => {
      it('renders the ListRepo', async () => {
        setup()
        render(<HomePage />, { wrapper })

        const listRepo = await screen.findByText(/ListRepo/)
        expect(listRepo).toBeInTheDocument()
      })

      it('renders the context switcher', async () => {
        setup()
        render(<HomePage />, { wrapper })

        const contextSwitcher = await screen.findByText(/MyContextSwitcher/)
        expect(contextSwitcher).toBeInTheDocument()
      })

      it('renders banners component', async () => {
        setup()
        render(<HomePage />, { wrapper })

        const banners = await screen.findByText(/Banners/)
        expect(banners).toBeInTheDocument()
      })
    })

    describe('when user has sentry token set', () => {
      describe('when token is successfully validated', () => {
        it('redirects them to plan page', async () => {
          setup()

          localStorage.setItem('sentry-token', 'super-cool-token')

          render(<HomePage />, { wrapper })

          await waitFor(() => expect(testLocation.pathname).toBe('/plan/gh'))
        })
      })

      describe('when token is not successfully validated', () => {
        it('does not redirect them', async () => {
          setup({ successfulMutation: false })

          localStorage.setItem('sentry-token', 'super-cool-token')

          render(<HomePage />, { wrapper })

          await waitFor(() => expect(testLocation.pathname).toBe('/gh'))
        })
      })
    })
  })

  describe('when user is not authenticated', () => {
    it('redirects user to login page', async () => {
      setup({ successfulUser: false })

      render(<HomePage />, { wrapper })

      await waitFor(() => expect(testLocation.pathname).toBe('/login/gh'))
    })
  })
})
