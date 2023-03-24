import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useImage } from 'services/image'
import { useImpersonate } from 'services/impersonate'

import LimitedLayout from './LimitedLayout'

jest.mock('services/image')
jest.mock('services/impersonate')

const user = {
  username: 'CodecovUser',
  email: 'codecov@codecov.io',
  name: 'codecov',
  avatarUrl: 'photo',
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

    it('a regular header', () => {
      render(<LimitedLayout>Why do we fall?</LimitedLayout>, {
        wrapper: wrapper(),
      })

      const regularHeader = screen.getByTestId('header')
      expect(regularHeader).toHaveClass('bg-ds-gray-octonary')
    })

    it('children', async () => {
      render(<LimitedLayout>Why do we fall?</LimitedLayout>, {
        wrapper: wrapper(),
      })

      const content = await screen.findByText('Why do we fall?')
      expect(content).toBeInTheDocument()
    })

    it('a user avatar', async () => {
      render(<LimitedLayout>Why do we fall?</LimitedLayout>, {
        wrapper: wrapper(),
      })

      const avatar = await screen.findByRole('img', { name: 'avatar' })
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('renders while impersonated', () => {
    beforeEach(() => setup({ isImpersonating: true }))

    it('a pink header', () => {
      render(<LimitedLayout>Why do we fall?</LimitedLayout>, {
        wrapper: wrapper(),
      })

      const pinkHeader = screen.getByTestId('header')
      expect(pinkHeader).toHaveClass('bg-ds-pink-tertiary')
    })
  })
})
