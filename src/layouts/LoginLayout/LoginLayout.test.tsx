import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { ThemeContextProvider } from 'shared/ThemeContext'

import LoginLayout from './LoginLayout'

const mocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const module = await import('react-router-dom')
  return {
    ...module,
    useLocation: mocks.useLocation,
  }
})
window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

const server = setupServer()
const queryClient = new QueryClient()

const wrapper =
  (
    { initialEntries = '/login', path = '/login' } = {
      initialEntries: '/login',
      path: '/login',
    }
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeContextProvider>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path={path}>{children}</Route>
        </MemoryRouter>
      </ThemeContextProvider>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
  console.error = () => {}
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
  vi.restoreAllMocks()
})

describe('LoginLayout', () => {
  function setup() {
    server.use(
      graphql.query('CurrentUser', (info) => {
        return HttpResponse.json({ data: { me: null } })
      })
    )
    mocks.useLocation.mockReturnValue({ search: [] })
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

      mocks.useLocation.mockReturnValueOnce({
        search: 'expired',
      })

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })
      await waitFor(() => {
        expect(screen.getByText(/Your session has expired/)).toBeInTheDocument()
      })
    })
  })
})
