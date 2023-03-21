import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'

import MemberTable from './MemberTable'

const queryClient = new QueryClient()
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
  planAutoActivate: true,
  seatsUsed: 10,
  seatsLimit: 10,
}

const mockOpenSeatsTaken = {
  planAutoActivate: true,
  seatsUsed: 5,
  seatsLimit: 10,
}

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/admin/gh/members']}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </MemoryRouter>
)

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

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
      rest.get('/internal/settings', (req, res, ctx) => {
        if (seatsOpen) {
          return res(ctx.status(200), ctx.json(mockOpenSeatsTaken))
        }
        return res(ctx.status(200), ctx.json(mockAllSeatsTaken))
      })
    )

    return { user }
  }

  describe('renders table', () => {
    it('displays header', async () => {
      setup()
      render(<MemberTable />, { wrapper })

      const header = await screen.findByText('User Name')
      expect(header).toBeInTheDocument()
    })

    it('displays initial user set', async () => {
      setup()
      render(<MemberTable />, { wrapper })

      const user = await screen.findByText('User 1')
      expect(user).toBeInTheDocument()
    })

    it('displays extended list after loading more', async () => {
      const { user } = setup()
      render(<MemberTable />, { wrapper })

      const button = await screen.findByText('Load More')
      await user.click(button)

      const user1 = screen.getByText('User 1')
      expect(user1).toBeInTheDocument()

      const user2 = await screen.findByText('user2-codecov')
      expect(user2).toBeInTheDocument()
    })
  })

  describe('renders load more button', () => {
    beforeEach(() => setup())

    it('displays the button', async () => {
      render(<MemberTable />, { wrapper })

      const button = await screen.findByText('Load More')
      expect(button).toBeInTheDocument()
    })
  })

  describe('activating a user', () => {
    describe('there are no seats open', () => {
      it('disables the toggle', async () => {
        const { user } = setup({ seatsOpen: false })
        render(<MemberTable />, { wrapper })

        let toggles = await screen.findAllByRole('button', {
          name: 'Non-Active',
        })
        expect(toggles.length).toBe(1)

        let toggle = await screen.findByRole('button', { name: 'Non-Active' })
        await user.click(toggle)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        toggle = await screen.findByRole('button', { name: 'Non-Active' })
        expect(toggle).toBeInTheDocument()

        toggles = await screen.findAllByRole('button', { name: 'Non-Active' })
        expect(toggles.length).toBe(1)
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

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

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

  describe('deactivating a user', () => {
    it('updates the users activation', async () => {
      const { user } = setup({ returnActivated: true })
      render(<MemberTable />, { wrapper })

      const activeToggleClick = await screen.findByRole('button', {
        name: 'Activated',
      })
      await user.click(activeToggleClick)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const nonActiveToggle = await screen.findByRole('button', {
        name: 'Non-Active',
      })
      expect(nonActiveToggle).toBeInTheDocument()

      const activeToggle = screen.queryByRole('button', { name: 'Activated' })
      expect(activeToggle).not.toBeInTheDocument()
    })
  })

  describe('table has no data', () => {
    beforeEach(() => setup({ noData: true }))

    it('displays an empty table', async () => {
      render(<MemberTable />, { wrapper })

      const table = await screen.findByTestId('body-row')
      expect(table).toBeEmptyDOMElement()
    })
  })
})
