import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import useIntersection from 'react-use/lib/useIntersection'

import { useAddNotification } from 'services/toastNotification'

import DefaultBranch from './DefaultBranch'

jest.mock('services/toastNotification')
jest.mock('react-use/lib/useIntersection')

const mockBranches = (hasNextPage = false) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branches: {
        edges: [
          {
            node: {
              name: 'main',
              head: {
                commitid: '1',
              },
            },
          },
          {
            node: {
              name: 'dummy',
              head: {
                commitid: '2',
              },
            },
          },
          {
            node: {
              name: 'dummy2',
              head: {
                commitid: '3',
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage,
          endCursor: 'someEndCursor',
        },
      },
    },
  },
})

const mockNextBranches = (hasNextPage = false) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branches: {
        edges: [
          {
            node: {
              name: 'second',
              head: {
                commitid: '1',
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage,
          endCursor: 'someEndCursor',
        },
      },
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/codecov/codecov-client/settings') =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={[initialEntries]}>
        <QueryClientProvider client={queryClient}>
          <Route path="/:provider/:owner/:repo/settings">{children}</Route>
        </QueryClientProvider>
      </MemoryRouter>
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

describe('DefaultBranch', () => {
  function setup(
    { hasNextPage, isIntersecting, failMutation } = {
      hasNextPage: false,
      isIntersecting: false,
      failMutation: false,
    }
  ) {
    const user = userEvent.setup()
    const mutate = jest.fn()
    const addNotification = jest.fn()
    const fetchesNextPage = jest.fn()
    const fetchFilters = jest.fn()

    server.use(
      graphql.query('GetBranches', (req, res, ctx) => {
        const afterCursorPassed = !!req.variables?.after
        if (afterCursorPassed) {
          fetchesNextPage()
          const data = mockNextBranches(false)
          return res(ctx.status(200), ctx.data(data))
        }

        fetchFilters(req.variables?.filters)
        const data = mockBranches(hasNextPage)

        return res(ctx.status(200), ctx.data(data))
      }),

      rest.patch(
        '/internal/github/codecov/repos/codecov-client/',
        async (req, res, ctx) => {
          const data = await req?.json()
          mutate()

          if (failMutation) {
            return res(ctx.status(500))
          }

          return res(ctx.status(200), ctx.json(data))
        }
      )
    )

    useAddNotification.mockReturnValue(addNotification)

    useIntersection.mockReturnValue({
      isIntersecting: isIntersecting,
    })

    return { mutate, addNotification, fetchesNextPage, fetchFilters, user }
  }

  describe('renders Default Branch component', () => {
    beforeEach(() => setup())

    it('renders title', async () => {
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const title = await screen.findByText(/Default Branch/)
      expect(title).toBeInTheDocument()
    })

    it('renders body', async () => {
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const p = await screen.findByText(
        'Selection for branch context of data in coverage dashboard'
      )
      expect(p).toBeInTheDocument()
    })

    it('renders branch context', async () => {
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const label = screen.getByText(/Branch Context/)
      expect(label).toBeInTheDocument()

      const select = await screen.findByRole('button', {
        name: 'Branch selector',
      })
      expect(select).toBeInTheDocument()
    })
  })

  describe('when clicking on select btn', () => {
    it('renders all branches of repo', async () => {
      const { user } = setup()
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const branchSelector = await screen.findByRole('button', {
        name: 'Branch selector',
      })
      await user.click(branchSelector)

      const branch1 = await screen.findByText('dummy')
      expect(branch1).toBeInTheDocument()

      const branch2 = await screen.findByText('dummy2')
      expect(branch2).toBeInTheDocument()
    })

    describe('when user selects a branch', () => {
      it('calls the mutation', async () => {
        const { mutate, user } = setup()

        render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

        const branchSelector = await screen.findByRole('button', {
          name: 'Branch selector',
        })
        await user.click(branchSelector)

        const dummyBranch = await screen.findByText('dummy')
        await user.click(dummyBranch)

        await waitFor(() => expect(mutate).toHaveBeenCalled())
      })
    })
  })

  describe('when mutation returns new default', () => {
    it('renders new default branch', async () => {
      const { user } = setup('dummy')
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const branchSelector = await screen.findByRole('button', {
        name: 'Branch selector',
      })
      await user.click(branchSelector)

      const dummyBranch = await screen.findByText('dummy')
      await user.click(dummyBranch)

      const updatedSelector = await screen.findByRole('button', {
        name: 'Branch selector',
      })

      await waitFor(() => expect(updatedSelector).toHaveTextContent('dummy'))
    })
  })

  describe('when mutation is not successful', () => {
    it('calls the mutation', async () => {
      const { mutate, user } = setup({ failMutation: true })
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const branchSelector = await screen.findByRole('button', {
        name: 'Branch selector',
      })
      await user.click(branchSelector)

      const dummyBranch = await screen.findByText('dummy')
      await user.click(dummyBranch)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
    })

    it('adds an error notification', async () => {
      const { addNotification, user } = setup({ failMutation: true })
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const branchSelector = await screen.findByRole('button', {
        name: 'Branch selector',
      })
      await user.click(branchSelector)

      const dummyBranch = await screen.findByText('dummy')
      await user.click(dummyBranch)

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'We were unable to update the default branch for this repo',
        })
      )
    })
  })

  describe('when onLoadMore is triggered', () => {
    describe('when there is a next page', () => {
      it('calls fetchNextPage', async () => {
        const { fetchesNextPage, user } = setup({
          hasNextPage: true,
          isIntersecting: true,
        })

        render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

        const select = screen.getByText('main')
        await user.click(select)

        await waitFor(() => expect(fetchesNextPage).toBeCalled())
      })
    })

    describe('when there is not a next page', () => {
      it('does not call fetchNextPage', async () => {
        const { fetchesNextPage, user } = setup({ isIntersecting: true })

        render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

        const select = await screen.findByText('main')
        await user.click(select)

        await waitFor(() => expect(fetchesNextPage).not.toBeCalled())
      })
    })
  })

  describe('when onSearch is triggered', () => {
    it('fetches with search value', async () => {
      const { fetchFilters, user } = setup({
        hasNextPage: true,
        isIntersecting: true,
      })
      render(<DefaultBranch defaultBranch="main" />, { wrapper: wrapper() })

      const select = await screen.findByText('main')
      await user.click(select)

      const searchInput = screen.getByRole('combobox')
      await user.click(searchInput)
      await user.keyboard('cool branch name')

      await waitFor(() =>
        expect(fetchFilters).toBeCalledWith({
          searchValue: 'cool branch name',
          mergedBranches: true,
        })
      )
    })
  })
})
