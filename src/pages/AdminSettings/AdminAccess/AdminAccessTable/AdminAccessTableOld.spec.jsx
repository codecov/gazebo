import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminAccessTableOld from './AdminAccessTableOld'

const mockFirstResponse = {
  count: 1,
  next: 'http://localhost/internal/users?is_admin=true&page=2',
  previous: null,
  results: [
    {
      ownerid: 1,
      username: 'user1-codecov',
      email: 'user1@codecov.io',
      name: 'User 1',
      isAdmin: true,
      activated: true,
    },
  ],
  total_pages: 2,
}

const mockSecondResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      ownerid: 2,
      username: 'user2-codecov',
      email: 'user2@codecov.io',
      name: null,
      isAdmin: true,
      activated: true,
    },
  ],
  total_pages: 2,
}

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/gh']}>
          <Route path="/:provider">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('AdminAccessTable', () => {
  function setup({ noData = false }) {
    server.use(
      rest.get('/internal/users', (req, res, ctx) => {
        if (noData) {
          return res(
            ctx.status(200),
            ctx.json({
              count: 0,
              next: null,
              previous: null,
              results: [],
              total_pages: 0,
            })
          )
        }

        const {
          url: { searchParams },
        } = req

        const pageNumber = Number(searchParams.get('page'))

        if (pageNumber > 1) {
          return res(ctx.status(200), ctx.json(mockSecondResponse))
        }

        return res(ctx.status(200), ctx.json(mockFirstResponse))
      })
    )
  }

  describe('renders table', () => {
    beforeEach(() => {
      setup({})
    })

    it('displays the table heading', async () => {
      render(<AdminAccessTableOld />, { wrapper: wrapper() })

      const admin = await screen.findByText('Admin')
      expect(admin).toBeInTheDocument()
    })
  })

  describe('renders load more button', () => {
    beforeEach(() => {
      setup({})
    })

    it('displays the button', async () => {
      render(<AdminAccessTableOld />, { wrapper: wrapper() })

      const button = await screen.findByText('Load More')
      expect(button).toBeInTheDocument()
    })
  })

  describe('table displays users', () => {
    beforeEach(() => {
      setup({})
    })

    it('displays an initial user set', async () => {
      render(<AdminAccessTableOld />, { wrapper: wrapper() })

      const user = await screen.findByText('User 1')
      expect(user).toBeInTheDocument()
    })

    it('displays extended list after button click', async () => {
      const user = userEvent.setup()
      render(<AdminAccessTableOld />, { wrapper: wrapper() })

      const user1 = await screen.findByText('User 1')
      expect(user1).toBeInTheDocument()

      const button = await screen.findByText('Load More')
      await user.click(button)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const user2 = await screen.findByText('user2-codecov')
      expect(user2).toBeInTheDocument()
    })
  })

  describe('table has no data', () => {
    beforeEach(() => {
      setup({ noData: true })
    })

    it('displays an empty table', async () => {
      render(<AdminAccessTableOld />, { wrapper: wrapper() })

      const table = await screen.findByTestId('body-row')
      expect(table).toBeEmptyDOMElement()
    })
  })
})
