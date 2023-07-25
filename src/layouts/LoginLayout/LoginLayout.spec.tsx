import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router'

import LoginLayout from './LoginLayout'

console.error = () => {}

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
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('LoginLayout', () => {
  function setup() {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => res(ctx.status(200)))
    )
  }

  describe('rendering component', () => {
    it('renders logo button with expected link', () => {
      setup()

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })

      const link = screen.getByRole('link', { name: /Link to Homepage/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://about.codecov.io')
    })

    it('renders new to codecov link', () => {
      setup()

      render(<LoginLayout>child content</LoginLayout>, {
        wrapper: wrapper({
          initialEntries: '/login/gh',
          path: '/login/:provider',
        }),
      })

      const text = screen.getByText(/New to Codecov\?/)
      expect(text).toBeInTheDocument()

      const link = screen.getByRole('link', { name: /Learn more/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', 'https://about.codecov.io')
    })

    it('renders children', () => {
      setup()

      render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })

      const child = screen.getByText('child content')
      expect(child).toBeInTheDocument()
    })
  })
})
