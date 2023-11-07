import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter } from 'react-router-dom'

import CommitsTable from './CommitsTable'

const genMockWrapper = ({ commits = [], hasNextPage = false }) => ({
  owner: {
    repository: {
      commits: {
        edges: commits,
        pageInfo: {
          hasNextPage,
          endCursor: 'some cursor',
        },
      },
    },
  },
})

const mockCommits = ({ hasNextPage } = { hasNextPage: false }) =>
  genMockWrapper({
    commits: [
      {
        node: {
          ciPassed: true,
          message: 'commit message 1',
          commitid: 'id1',
          createdAt: '2021-08-30T19:33:49.819672',
          author: {
            username: 'user-1',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 100,
            },
          },
          compareWithParent: {
            patchTotals: {
              coverage: 100,
            },
          },
        },
      },
      {
        node: {
          ciPassed: true,
          message: 'commit message 2',
          commitid: 'id2',
          createdAt: '2021-08-30T19:33:49.819672',
          author: {
            username: 'user-1',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          totals: {
            coverage: 100,
          },
          parent: {
            totals: {
              coverage: 100,
            },
          },
          compareWithParent: {
            patchTotals: {
              coverage: 100,
            },
          },
        },
      },
    ],
    hasNextPage,
  })

const mockNullCommit = genMockWrapper({ commits: [null] })

const mockInvalidPatchCommit = genMockWrapper({
  commits: [
    {
      node: {
        ciPassed: true,
        message: 'commit message 1',
        commitid: 'id1',
        createdAt: '2021-08-30T19:33:49.819672',
        author: {
          username: 'user-1',
          avatarUrl: 'http://127.0.0.1/avatar-url',
        },
        totals: {
          coverage: 100,
        },
        parent: {
          totals: {
            coverage: 100,
          },
        },
        compareWithParent: {
          patchTotals: {
            coverage: null,
          },
        },
      },
    },
  ],
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <MemoryRouter>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

describe('CommitsTable', () => {
  function setup({ commitData } = { commitData: mockCommits() }) {
    const fetchesNextPage = jest.fn()
    server.use(
      graphql.query('GetCommits', (req, res, ctx) => {
        if (!!req?.variables?.after) {
          fetchesNextPage(req?.variables?.after)
        }

        return res(ctx.status(200), ctx.data(commitData))
      })
    )

    return { fetchesNextPage }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({ commitData: mockCommits() })
    })

    it('renders commit table Name header', async () => {
      render(<CommitsTable />, { wrapper })

      const name = await screen.findByText('Name')
      expect(name).toBeInTheDocument()
    })

    it('renders commit table Change header', async () => {
      render(<CommitsTable />, { wrapper })

      const change = await screen.findByText('Change')
      expect(change).toBeInTheDocument()
    })

    it('renders commit table Patch header', async () => {
      render(<CommitsTable />, { wrapper })

      const patch = await screen.findByText('Patch %')
      expect(patch).toBeInTheDocument()
    })

    it('renders commit table Coverage header', async () => {
      render(<CommitsTable />, { wrapper })

      const coverage = await screen.findByText('Coverage')
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('when rendered with no commits (length)', () => {
    beforeEach(() => {
      setup({
        commitData: [],
      })
    })

    it('renders an empty table', async () => {
      render(<CommitsTable />, { wrapper })

      const table = await screen.findByTestId('body-row')
      expect(table).toBeEmptyDOMElement()
    })
  })

  describe('when rendered with null commit', () => {
    beforeEach(() => {
      setup({
        commitData: mockNullCommit,
      })
    })

    it('renders on null message', async () => {
      render(<CommitsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const text = await screen.findByText(/we can't find this commit/)
      expect(text).toBeInTheDocument()
    })
  })

  describe('when rendered with an invalid patch value', () => {
    beforeEach(() => {
      setup({ commitData: mockInvalidPatchCommit })
    })

    it('render - for missing patch', async () => {
      render(<CommitsTable />, { wrapper })

      const changeValue = await screen.findByTestId('patch-value')
      expect(changeValue).toHaveTextContent('-')
    })
  })

  describe('when loading data', () => {
    beforeEach(() => {
      setup({ commitData: mockCommits() })
    })

    it('shows loading spinner', async () => {
      render(<CommitsTable />, {
        wrapper,
      })

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('load more button', () => {
    describe('hasNextPage is set to true', () => {
      it('displays the loadMore button', async () => {
        setup({ commitData: mockCommits({ hasNextPage: true }) })

        render(<CommitsTable />, {
          wrapper,
        })

        const loadMoreButton = await screen.findByText('Load More')
        expect(loadMoreButton).toBeInTheDocument()
      })

      describe('user clicks on load more button', () => {
        it('fetches the next page', async () => {
          const { fetchesNextPage } = setup({
            commitData: mockCommits({ hasNextPage: true }),
          })

          const user = userEvent.setup()
          render(<CommitsTable />, {
            wrapper,
          })

          const loadMoreButton = await screen.findByText('Load More')

          await user.click(loadMoreButton)

          await waitFor(() =>
            expect(fetchesNextPage).toBeCalledWith('some cursor')
          )
        })
      })
    })

    describe('hasNextPage is set to false', () => {
      beforeEach(() => {
        setup({ commitData: mockCommits({ hasNextPage: false }) })
      })

      it('does not display the loadMore button', async () => {
        render(<CommitsTable />, {
          wrapper,
        })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const loadMoreButton = screen.queryByText('Load More')
        expect(loadMoreButton).not.toBeInTheDocument()
      })
    })
  })
})
