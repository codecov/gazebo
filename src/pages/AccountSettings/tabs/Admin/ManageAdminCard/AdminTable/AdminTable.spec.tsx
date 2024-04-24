import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import AdminTable from './AdminTable'

const mockedFirstResponse = {
  count: 1,
  next: 'http://localhost/internal/users?page=2',
  previous: null,
  results: [
    {
      ownerid: 1,
      username: 'bob',
      email: 'user1@codecov.io',
      name: 'Bob',
      isAdmin: true,
      student: false,
      activated: false,
      lastPullTimestamp: null,
    },
  ],
  totalPages: 2,
}

const mockedSecondResponse = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      ownerid: 2,
      username: 'alice',
      email: 'user2@codecov.io',
      name: null,
      isAdmin: true,
      student: false,
      activated: true,
      lastPullTimestamp: null,
    },
  ],
  totalPages: 2,
}

const mockedNullUsername = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      ownerid: 1,
      username: null,
      email: 'user3@codecov.io',
      name: 'Popcorn',
      isAdmin: true,
      student: false,
      activated: true,
      lastPullTimestamp: null,
    },
  ],
  totalPages: 1,
}

const mockedEmptyAdmins = {
  count: 0,
  next: null,
  previous: null,
  results: [],
  totalPages: 0,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

type SetupArgs = {
  nullUsername?: boolean
  emptyAdmins?: boolean
}

describe('AdminTable', () => {
  let requestSearchParams: URLSearchParams
  let patchRequest: { userId: string; body: Promise<any> }

  function setup({ nullUsername = false, emptyAdmins = false }: SetupArgs) {
    const user = userEvent.setup({})
    server.use(
      rest.patch(
        '/internal/:provider/codecov/users/:userId',
        (req, res, ctx) => {
          patchRequest = {
            userId: req.params.userId as string,
            body: req.json(),
          }
          return res(ctx.status(204))
        }
      ),
      rest.get('/internal/:provider/codecov/users', (req, res, ctx) => {
        if (nullUsername) {
          return res(ctx.status(200), ctx.json(mockedNullUsername))
        }
        if (emptyAdmins) {
          return res(ctx.status(200), ctx.json(mockedEmptyAdmins))
        }

        requestSearchParams = req.url.searchParams
        const pageNum = Number(requestSearchParams.get('page'))

        if (pageNum > 1) {
          return res(ctx.status(200), ctx.json(mockedSecondResponse))
        }

        return res(ctx.status(200), ctx.json(mockedFirstResponse))
      })
    )
    mockAllIsIntersecting(false)
    return { user }
  }

  describe('rendering AdminTable', () => {
    describe('renders table header', () => {
      it('renders Username column', async () => {
        setup({})
        render(<AdminTable />, { wrapper })
        const username = await screen.findByText('Username')
        expect(username).toBeInTheDocument()
      })

      it('renders Email column', async () => {
        setup({})
        render(<AdminTable />, { wrapper })
        const email = await screen.findByText('Email')
        expect(email).toBeInTheDocument()
      })
    })

    describe('renders table data', () => {
      it('renders Username', async () => {
        setup({})
        render(<AdminTable />, { wrapper })
        const username = await screen.findByText('bob')
        expect(username).toBeInTheDocument()
      })

      it('renders name when username is null', async () => {
        setup({ nullUsername: true })
        render(<AdminTable />, { wrapper })
        const username = await screen.findByText('Popcorn')
        expect(username).toBeInTheDocument()
      })

      it('renders Email', async () => {
        setup({})
        render(<AdminTable />, { wrapper })
        const email = await screen.findByText('user1@codecov.io')
        expect(email).toBeInTheDocument()
      })

      it('renders Revoke button', async () => {
        setup({})
        render(<AdminTable />, { wrapper })
        const button = await screen.findByRole('button', { name: 'Revoke' })
        expect(button).toBeInTheDocument()
      })
    })

    describe('pagination', () => {
      it('fetches the next page when bottom of table is visible', async () => {
        setup({})
        render(<AdminTable />, { wrapper })
        const username = await screen.findByText('bob')
        expect(username).toBeInTheDocument()

        const loading = await screen.findByText('Loading')
        expect(loading).toBeInTheDocument()

        mockAllIsIntersecting(true)
        await waitFor(() => queryClient.isFetching())

        const username2 = await screen.findByText('alice')
        expect(username).toBeInTheDocument()
        expect(username2).toBeInTheDocument()
      })
    })

    describe('sorting', () => {
      it('defaults to username ascending', async () => {
        setup({})
        render(<AdminTable />, { wrapper })
        const username = await screen.findByText('bob')
        expect(username).toBeInTheDocument()
        expect(requestSearchParams.get('ordering')).toBe('username')
      })

      it('clicking username toggles sort', async () => {
        const { user } = setup({})
        render(<AdminTable />, { wrapper })
        const username = await screen.findByText('Username')
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe('username')
        )
        await user.click(username)
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe(null)
        )
        await user.click(username)
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe('-username')
        )
        await user.click(username)
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe('username')
        )
      })

      it('clicking email toggles sort', async () => {
        const { user } = setup({})
        render(<AdminTable />, { wrapper })
        const email = await screen.findByText('Email')
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe('username')
        )
        await user.click(email)
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe('email')
        )
        await user.click(email)
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe('-email')
        )
        await user.click(email)
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe(null)
        )
        await user.click(email)
        await waitFor(() =>
          expect(requestSearchParams.get('ordering')).toBe('email')
        )
      })
    })

    describe('Revoke button', () => {
      it('should make appropriate network request', async () => {
        const { user } = setup({})
        render(<AdminTable />, { wrapper })

        const button = await screen.findByRole('button', { name: 'Revoke' })
        expect(button).toBeInTheDocument()

        await user.click(button)

        await waitFor(() => queryClient.isFetching())
        await waitFor(() => !queryClient.isFetching())

        const { userId, body } = patchRequest
        expect(userId).toBe('1')
        expect(await body).toMatchObject({ is_admin: false })
      })
    })

    describe('Empty state', () => {
      it('should render no admins message', async () => {
        setup({ emptyAdmins: true })
        render(<AdminTable />, { wrapper })

        const message = await screen.findByText(/No admins yet./)
        expect(message).toBeInTheDocument()
      })
    })
  })
})
