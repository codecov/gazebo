import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './HeaderTeam'

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
        compareWithBase: {
          __typename: 'Comparison',
          patchTotals: {
            percentCovered: 35.45,
          },
        },
      },
    },
  },
})

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
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
      graphql.query('PullHeadDataTeam', (info) => {
        if (nullPull) {
          return HttpResponse.json({ data: { owner: { repository: null } } })
        }

        return HttpResponse.json({
          data: mockPullData({ pullState, ciStatus }),
        })
      })
    )
  }

  it('renders the title', async () => {
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
      it('renders PR closed status', async () => {
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
      it('does not render PR status', async () => {
        setup({ nullPull: true })
        render(<Header />, { wrapper })

        await waitFor(() => queryClientV5.isFetching)
        await waitFor(() => !queryClientV5.isFetching)

        const open = screen.queryByText(/open/i)
        expect(open).not.toBeInTheDocument()

        const closed = screen.queryByText(/closed/i)
        expect(closed).not.toBeInTheDocument()

        const merged = screen.queryByText(/merged/i)
        expect(merged).not.toBeInTheDocument()
      })
    })
  })

  it('renders the authors username', async () => {
    setup({})
    render(<Header />, { wrapper })

    const authorUsername = await screen.findByText(/cool-user/i)
    expect(authorUsername).toBeInTheDocument()
  })

  it('renders the pull request id', async () => {
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

  it('renders the patch coverage', async () => {
    setup({})
    render(<Header />, { wrapper })

    const patchCoverage = await screen.findByText(/Patch Coverage/)
    expect(patchCoverage).toBeInTheDocument()

    const patchCoverageValue = await screen.findByText(/35.45/)
    expect(patchCoverageValue).toBeInTheDocument()
  })
})
