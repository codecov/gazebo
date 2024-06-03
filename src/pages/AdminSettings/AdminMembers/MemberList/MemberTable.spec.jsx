import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import MemberTable from './MemberTable'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, cacheTime: Infinity } },
})
const server = setupServer()

const mockedFirstResponse = {
  count: 1,
  next: 'http://localhost/internal/users?page=2',
  previous: null,
  results: [
    {
      ownerid: 1,
      username: 'user1-codecov',
      email: 'user1@codecov.io',
      name: 'User 1',
      isAdmin: true,
      activated: false,
    },
  ],
  totalPages: 2,
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
      isAdmin: false,
      activated: true,
    },
  ],
  total_pages: 2,
}

const mockAllSeatsTaken = {
  config: {
    planAutoActivate: true,
    seatsUsed: 10,
    seatsLimit: 10,
  },
}

const mockOpenSeatsTaken = {
  config: {
    planAutoActivate: true,
    seatsUsed: 5,
    seatsLimit: 10,
  },
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/admin/gh/members']}>
      <Route path="/admin/:provider/members">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('MemberTable', () => {
  function setup(
    { noData = false, seatsOpen = true, returnActivated = false } = {
      noData: false,
      seatsOpen: true,
      returnActivated: false,
    }
  ) {
    const user = userEvent.setup()
    // resetting mock response values
    mockedFirstResponse.results[0].activated = false
    mockSecondResponse.results[0].activated = true

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
              totalPages: 0,
            })
          )
        }

        const {
          url: { searchParams },
        } = req

        const pageNumber = Number(searchParams.get('page'))

        if (pageNumber > 1) {
          return res(ctx.status(200), ctx.json(mockSecondResponse))
        } else if (returnActivated) {
          return res(ctx.status(200), ctx.json(mockSecondResponse))
        }
        return res(ctx.status(200), ctx.json(mockedFirstResponse))
      }),
      rest.patch('/internal/users/:id', (req, res, ctx) => {
        const { id: idString } = req.params

        const id = Number(idString)

        if (id === 1) {
          mockedFirstResponse.results[0].activated =
            !mockedFirstResponse.results[0].activated
        } else if (id === 2) {
          mockSecondResponse.results[0].activated =
            !mockSecondResponse.results[0].activated
        }

        return res(ctx.status(200))
      }),
      graphql.query('SelfHostedSettings', (req, res, ctx) => {
        if (seatsOpen) {
          return res(ctx.status(200), ctx.data(mockOpenSeatsTaken))
        }
        return res(ctx.status(200), ctx.data(mockAllSeatsTaken))
      })
    )

    mockAllIsIntersecting(false)

    return { user }
  }

  describe('renders table', () => {
    it('displays header', async () => {
      setup()
      render(<MemberTable />, { wrapper })

      const header = await screen.findByText('Username')
      expect(header).toBeInTheDocument()
    })

    it('displays initial user set', async () => {
      setup()
      render(<MemberTable />, { wrapper })

      const user = await screen.findByText('User 1')
      expect(user).toBeInTheDocument()
    })

    it('displays extended list after loading more', async () => {
      setup()
      render(<MemberTable />, { wrapper })

      const user1 = await screen.findByText('User 1')
      expect(user1).toBeInTheDocument()

      mockAllIsIntersecting(true)

      const user2 = await screen.findByText('user2-codecov')
      expect(user2).toBeInTheDocument()
    })
  })

  describe('activating a user', () => {
    describe('there are no seats open', () => {
      describe('user is not a student', () => {
        it('disables the toggle', async () => {
          setup({ seatsOpen: false })
          render(<MemberTable />, { wrapper })

          const toggle = await screen.findByRole('button', {
            name: 'Non-Active',
          })
          expect(toggle).toBeDisabled()
        })
      })

      describe.skip('user is a student', () => {
        it('updates the users activate', async () => {
          const { user } = setup({ student: true, seatsOpen: false })
          render(<MemberTable />, { wrapper })

          const nonActiveToggleClick = await screen.findByRole('button', {
            name: 'Non-Active',
          })
          expect(nonActiveToggleClick).toBeInTheDocument()
          await user.click(nonActiveToggleClick)

          const activeToggle = await screen.findByRole('button', {
            name: 'Activated',
          })
          expect(activeToggle).toBeInTheDocument()

          const nonActiveToggle = screen.queryByRole('button', {
            name: 'Non-Active',
          })
          expect(nonActiveToggle).not.toBeInTheDocument()
        })
      })
    })

    describe('there are open seats', () => {
      it('updates the users activation', async () => {
        const { user } = setup()
        render(<MemberTable />, { wrapper })

        const nonActiveToggleClick = await screen.findByRole('button', {
          name: 'Non-Active',
        })
        await user.click(nonActiveToggleClick)

        const activeToggle = await screen.findByRole('button', {
          name: 'Activated',
        })
        expect(activeToggle).toBeInTheDocument()
      })
    })
  })

  describe('deactivating a user', () => {
    it('updates the users activation', async () => {
      const { user } = setup({ returnActivated: true })
      render(<MemberTable />, { wrapper })

      const activeToggleClick = await screen.findByRole('button', {
        name: 'Activated',
      })
      expect(activeToggleClick).toBeInTheDocument()
      await user.click(activeToggleClick)

      const nonActiveToggle = await screen.findByLabelText('Non-Active')
      expect(nonActiveToggle).toBeInTheDocument()
    })
  })

  describe('table has no data', () => {
    it('displays an empty table', async () => {
      setup({ noData: true })
      render(<MemberTable />, { wrapper })

      const noMembersMsg = await screen.findByText('No members found')
      expect(noMembersMsg).toBeInTheDocument()
    })
  })
})
