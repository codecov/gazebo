import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useImage } from 'services/image'
import { useImpersonate } from 'services/impersonate'

import LimitedHeader from './LimitedHeader'

jest.mock('services/image')
jest.mock('services/impersonate')

const user = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'http://127.0.0.1/avatar-url',
  onboardingCompleted: false,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = ['/bb/batman/batcave']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('LimitedLayout', () => {
  afterEach(() => jest.resetAllMocks())

  function setup({ isImpersonating = false } = { isImpersonating: false }) {
    useImage.mockReturnValue({ src: 'photo', isLoading: false, error: null })
    useImpersonate.mockReturnValue({ isImpersonating })

    server.use(
      graphql.query('CurrentUser', (_, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            me: { user: user, trackingMetadata: { ownerid: 123 }, ...user },
          })
        )
      )
    )
  }

  describe('renders', () => {
    beforeEach(() => setup())

    it('a regular header', async () => {
      render(<LimitedHeader />, {
        wrapper: wrapper(),
      })

      const regularHeader = await screen.findByTestId('header')
      expect(regularHeader).toHaveClass('bg-ds-gray-octonary')
    })

    it('a user avatar', async () => {
      render(<LimitedHeader />, {
        wrapper: wrapper(),
      })

      const avatar = await screen.findByRole('img', { name: 'avatar' })
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('renders while impersonated', () => {
    beforeEach(() => setup({ isImpersonating: true }))

    it('a pink header', async () => {
      render(<LimitedHeader />, {
        wrapper: wrapper(),
      })

      const pinkHeader = await screen.findByTestId('header')
      expect(pinkHeader).toHaveClass('bg-ds-pink-tertiary')
    })
  })

  describe('Avatar render logic', () => {
    beforeEach(() => setup())

    it(`isn't rendered on first render`, () => {
      render(<LimitedHeader />, {
        wrapper: wrapper(),
      })

      const avatar = screen.queryByRole('img', { name: 'avatar' })
      expect(avatar).not.toBeInTheDocument()
    })

    it('is rendered once useUser settles', async () => {
      render(<LimitedHeader />, {
        wrapper: wrapper(),
      })

      const avatar = await screen.findByRole('img', { name: 'avatar' })
      expect(avatar).toBeInTheDocument()
    })
  })
})
