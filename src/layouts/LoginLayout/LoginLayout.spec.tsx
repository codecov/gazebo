import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router'
import { useLocation } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import LoginLayout from './LoginLayout'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}))
jest.mock('shared/featureFlags')

const mockedUseLocation = useLocation as jest.Mock
const mockedUseFlags = useFlags as jest.Mock

const server = setupServer()
const queryClient = new QueryClient()

const wrapper =
  (
    { initialEntries = '/login', path = '/login' } = {
      initialEntries: '/login',
      path: '/login',
    }
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={path}>{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
  console.error = () => {}
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
  jest.restoreAllMocks()
})

describe('LoginLayout', () => {
  function setup() {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ me: null }))
      )
    )
    mockedUseLocation.mockReturnValue({ search: [] })
    mockedUseFlags.mockReturnValue({ newHeader: false })
  }

  describe('rendering component', () => {
    it('renders logo button with expected link', () => {
      setup()

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })

      const link = screen.getByRole('link', { name: /Link to Homepage/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://about.codecov.io')
    })

    it('renders guest header', () => {
      setup()

      render(<LoginLayout>child content</LoginLayout>, {
        wrapper: wrapper({
          initialEntries: '/login/gh',
          path: '/login/:provider',
        }),
      })

      const text = screen.getByText(/Why Test Code\?/)
      expect(text).toBeInTheDocument()
    })

    it('renders children', () => {
      setup()

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })

      const child = screen.getByText('child content')
      expect(child).toBeInTheDocument()
    })
  })

  describe('when session is expired', () => {
    it('renders the expiry banner when query param set', async () => {
      setup()

      mockedUseLocation.mockReturnValueOnce({
        search: 'expired',
      })

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })
      await waitFor(() => {
        expect(screen.getByText(/Your session has expired/)).toBeInTheDocument()
      })
    })
  })

  describe('header feature flagging', () => {
    it('renders old header when feature flag is false', async () => {
      setup()

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })

      const blogLink = await screen.findByText('Why Test Code?')
      expect(blogLink).toBeInTheDocument()
    })

    it('renders new header when feature flag is true', async () => {
      setup()
      mockedUseFlags.mockReturnValue({ newHeader: true })

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })

      const newHeader = await screen.findByText('Guest header')
      expect(newHeader).toBeInTheDocument()
    })
  })
})
