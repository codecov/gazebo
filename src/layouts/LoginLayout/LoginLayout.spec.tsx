import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router'

import LoginLayout from './LoginLayout'

const loggedInUser = {
  me: {
    user: {
      username: 'Codecov',
    },
  },
}

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
  function setup({ hasLoggedInUser = true } = {}) {
    server.use(
      graphql.query('CurrentUser', (req, res, ctx) => {
        if (hasLoggedInUser) {
          return res(ctx.status(200), ctx.data(loggedInUser))
        } else {
          return res(ctx.status(200), ctx.data({ me: null }))
        }
      })
    )
  }

  describe('rendering component', () => {
    describe('user is not authenticated', () => {
      it('renders logo button link', async () => {
        setup({ hasLoggedInUser: false })

        render(<LoginLayout>child content</LoginLayout>, { wrapper: wrapper() })

        const link = await screen.findByRole('link', {
          name: /Link to Homepage/,
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://about.codecov.io')
      })
    })

    describe('user is authenticated', () => {
      it('renders logo button link', async () => {
        setup()

        render(<LoginLayout>child content</LoginLayout>, {
          wrapper: wrapper({
            initialEntries: '/login/gh',
            path: '/login/:provider',
          }),
        })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        expect(
          await screen.findByRole('link', { name: /Link to Homepage/ })
        ).toBeInTheDocument()
        expect(
          await screen.findByRole('link', { name: /Link to Homepage/ })
        ).toHaveAttribute('href', '/gh/Codecov')
      })
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
