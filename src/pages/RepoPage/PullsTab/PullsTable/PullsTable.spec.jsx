import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { formatTimeToNow } from 'shared/utils/dates'

import PullsTable from './PullsTable'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()

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

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/Test/pulls']}>
    <Route path="/:provider/:owner/:repo/pulls">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('Pulls Table', () => {
  function setup({
    noPulls = false,
    nullPulls = false,
    overrideDetails = {},
    hasNextPage = false,
  }) {
    let edges = {
      edges: [
        {
          node: {
            author: { username: 'cool-user', avatarUrl: 'random' },
            compareWithBase: {
              __typename: 'Comparison',
              changeCoverage: 14,
              patchTotals: {
                percentCovered: 32,
              },
            },
            head: {
              totals: {
                percentCovered: 45,
              },
            },
            pullId: 746,
            state: 'MERGED',
            title: 'Test1',
            updatestamp: '2021-08-30T19:33:49.819672',
            ...overrideDetails,
          },
        },
      ],
    }

    if (noPulls) {
      edges = {
        edges: [],
      }
    }

    if (nullPulls) {
      edges = {
        edges: [null],
      }
    }

    const defaultPull = {
      owner: {
        repository: {
          __typename: 'Repository',
          pulls: {
            ...edges,
            pageInfo: {
              hasNextPage,
              endCursor: '',
            },
          },
        },
      },
    }

    server.use(
      graphql.query('GetPulls', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(defaultPull))
      )
    )
  }

  describe('when rendered with the full/correct available pulls data', () => {
    beforeEach(() => setup({}))

    it('renders pulls titles', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const title1 = await screen.findByText(/Test1/)
      expect(title1).toBeInTheDocument()
    })

    it('renders pulls authors', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const author1 = await screen.findByText(/cool-user/)
      expect(author1).toBeInTheDocument()
    })

    it('renders pulls updatestamp', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const dt = formatTimeToNow('2021-08-30T19:33:49.819672')
      const dt1 = await screen.findByText('last updated ' + dt)
      expect(dt1).toBeInTheDocument()
    })

    it('renders pulls ids', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const id1 = await screen.findByText(/#746/)
      expect(id1).toBeInTheDocument()
    })

    it('renders pulls coverage', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const cov1 = await screen.findByText(/45.00%/)
      expect(cov1).toBeInTheDocument()
    })

    it('renders pulls change from base', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const changeValue = await screen.findByTestId('change-value')
      const child = await within(changeValue).findByTestId('number-value')
      expect(child).toHaveTextContent('14.00%')
      expect(child).toHaveClass("before:content-['+']")
    })
  })

  describe('when rendered with a no pulls data', () => {
    beforeEach(() => {
      setup({ noPulls: true })
    })

    it('renders no pulls message', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const msg = await screen.findByText('no results found')
      expect(msg).toBeInTheDocument()
    })
  })

  describe('when rendered with missing pulls data', () => {
    beforeEach(() => {
      setup({
        nullPulls: true,
      })
    })

    it('renders missing pulls message', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const msg = await screen.findByText(/we can't find this pull/)
      expect(msg).toBeInTheDocument()
    })
  })

  describe('when pull rendered with null coverage', () => {
    beforeEach(() => {
      setup({
        overrideDetails: {
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals: null,
            changeCoverage: null,
          },
          head: {
            totals: {
              percentCovered: null,
            },
          },
        },
      })
    })

    it('renders text of null coverage', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const msg = await screen.findByText(/No report uploaded yet/)
      expect(msg).toBeInTheDocument()
    })

    it('renders id of the pull', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const id = await screen.findByText(/#746/)
      expect(id).toBeInTheDocument()
    })
  })

  describe('when pull rendered with CLOSE state', () => {
    beforeEach(() => {
      setup({
        overrideDetails: { state: 'CLOSED' },
      })
    })

    it('renders the icon pullRequestClosed', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const icon = await screen.findByText(/pull-request-closed.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when pull rendered with MERGED state', () => {
    beforeEach(() => {
      setup({})
    })

    it('renders the icon merge', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const icon = await screen.findByText(/merge.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when pull rendered with OPEN state', () => {
    beforeEach(() => {
      setup({
        overrideDetails: { state: 'OPEN' },
      })
    })

    it('renders the icon pullRequestOpen', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const icon = await screen.findByText(/pull-request-open.svg/)
      expect(icon).toBeInTheDocument()
    })
  })

  describe('when pull rendered with no head coverage', () => {
    beforeEach(() => {
      setup({
        overrideDetails: {
          head: {
            totals: null,
          },
        },
      })
    })

    it('does not render the change', async () => {
      render(<PullsTable />, { wrapper })

      const spinner = screen.queryByTestId('spinner')
      await waitFor(() => expect(spinner).not.toBeInTheDocument())

      const change = screen.queryByText(/90/)
      expect(change).not.toBeInTheDocument()
    })
  })

  describe('when there is a next page', () => {
    beforeEach(() => {
      setup({
        hasNextPage: true,
      })
    })
    it('displays load more button', async () => {
      render(<PullsTable />, { wrapper })

      const loadMore = await screen.findByText(/Load More/)
      expect(loadMore).toBeInTheDocument()
    })
  })
})
