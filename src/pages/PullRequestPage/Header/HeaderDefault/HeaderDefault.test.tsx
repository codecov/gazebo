import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './HeaderDefault'

const mockPullData = ({
  pullState = 'OPEN',
  ciStatus = true,
}: {
  pullState: 'OPEN' | 'CLOSED' | 'MERGED' | undefined
  ciStatus: boolean | null
}) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 1,
        title: 'Cool Pull Request',
        state: pullState,
        author: {
          username: 'cool-user',
        },
        head: {
          branchName: 'cool-branch',
          ciPassed: ciStatus,
        },
        updatestamp: '2020-01-01T12:00:00.000000',
      },
    },
  },
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
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

interface SetupArgs {
  pullState?: 'OPEN' | 'CLOSED' | 'MERGED' | undefined
  ciStatus?: boolean | null
  nullPull?: boolean
}

describe('Header', () => {
  function setup({
    pullState = 'OPEN',
    ciStatus = true,
    nullPull = false,
  }: SetupArgs) {
    server.use(
      graphql.query('PullHeadData', (info) => {
        if (nullPull) {
          return HttpResponse.json({ data: { owner: { repository: null } } })
        }

        return HttpResponse.json({
          data: mockPullData({ pullState, ciStatus }),
        })
      })
    )
  }

  describe('when rendered', () => {
    it('renders PR title', async () => {
      setup({})
      render(<Header />, { wrapper })

      const heading = await screen.findByRole('heading', {
        name: /Cool Pull Request/,
      })
      expect(heading).toBeInTheDocument()
    })

    describe('rendering PR status', () => {
      describe('when PR is open', () => {
        it('renders open PR status', async () => {
          setup({ pullState: 'OPEN' })
          render(<Header />, { wrapper })

          const open = await screen.findByText(/open/i)
          expect(open).toBeInTheDocument()
          expect(open).toHaveClass('bg-ds-primary-green')
        })
      })

      describe('when PR is closed', () => {
        it('renders closed PR status', async () => {
          setup({ pullState: 'CLOSED' })
          render(<Header />, { wrapper })

          const closed = await screen.findByText(/closed/i)
          expect(closed).toBeInTheDocument()
          expect(closed).toHaveClass('bg-ds-primary-red')
        })
      })

      describe('when PR is merged', () => {
        it('renders merged PR status', async () => {
          setup({ pullState: 'MERGED' })
          render(<Header />, { wrapper })

          const merged = await screen.findByText(/merged/i)
          expect(merged).toBeInTheDocument()
          expect(merged).toHaveClass('bg-ds-primary-purple')
        })
      })

      describe('when PR status is undefined', () => {
        it('does not render', async () => {
          setup({ nullPull: true })
          render(<Header />, { wrapper })

          await waitFor(() => queryClient.isFetching)
          await waitFor(() => !queryClient.isFetching)

          const open = screen.queryByText(/open/i)
          expect(open).not.toBeInTheDocument()

          const closed = screen.queryByText(/closed/i)
          expect(closed).not.toBeInTheDocument()

          const merged = screen.queryByText(/merged/i)
          expect(merged).not.toBeInTheDocument()
        })
      })
    })

    it('renders the author username', async () => {
      setup({})
      render(<Header />, { wrapper })

      const author = await screen.findByText(/cool-user/i)
      expect(author).toBeInTheDocument()
    })

    it('renders the pr id', async () => {
      setup({})
      render(<Header />, { wrapper })

      const prNumber = await screen.findByText(/#1/i)
      expect(prNumber).toBeInTheDocument()
    })

    describe('rendering CI status', () => {
      describe('when CI status is true', () => {
        it('renders CI passed status', async () => {
          setup({ ciStatus: true })
          render(<Header />, { wrapper })

          const ciStatus = await screen.findByText(/CI Passed/i)
          expect(ciStatus).toBeInTheDocument()
        })
      })

      describe('when CI status is false', () => {
        it('renders CI failed status', async () => {
          setup({ ciStatus: false })
          render(<Header />, { wrapper })

          const ciStatus = await screen.findByText(/CI Failed/i)
          expect(ciStatus).toBeInTheDocument()
        })
      })

      describe('when CI status is null', () => {
        it('renders no status', async () => {
          setup({ ciStatus: null })
          render(<Header />, { wrapper })

          const ciStatus = await screen.findByText(/No Status/i)
          expect(ciStatus).toBeInTheDocument()
        })
      })
    })

    it('renders the branch name', async () => {
      setup({})
      render(<Header />, { wrapper })

      const branchName = await screen.findByText(/cool-branch/i)
      expect(branchName).toBeInTheDocument()
    })
  })
})
