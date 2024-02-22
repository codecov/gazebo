import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleSummary from './BundleSummary'

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
}

const mockBranch = {
  branch: {
    name: 'main',
    head: {
      commitid: '321fdsa',
    },
  },
}

const mockBranches = {
  __typename: 'Repository',
  branches: {
    edges: [
      {
        node: {
          name: 'branch-1',
          head: {
            commitid: 'asdf123',
          },
        },
      },
      {
        node: {
          name: 'main',
          head: {
            commitid: '321fdsa',
          },
        },
      },
    ],
    pageInfo: {
      hasNextPage: false,
      endCursor: 'end-cursor',
    },
  },
}

const mockBranchBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundles: [{ name: 'bundle1' }],
          },
        },
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/bundles']}>
      <Route
        path={[
          '/:provider/:owner/:repo/bundles/:branch',
          '/:provider/:owner/:repo/bundles',
        ]}
      >
        {children}
      </Route>
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

describe('BundleSummary', () => {
  function setup() {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockRepoOverview } })
        )
      ),
      graphql.query('GetBranch', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: { __typename: 'Repository', ...mockBranch },
            },
          })
        )
      }),
      graphql.query('GetBranches', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ owner: { repository: mockBranches } })
        )
      }),
      graphql.query('BranchBundlesNames', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBranchBundles))
      })
    )
  }

  it('renders branch selector', async () => {
    setup()
    render(<BundleSummary />, { wrapper })

    const branchSelector = await screen.findByRole('button', {
      name: 'bundle branch selector',
    })
    expect(branchSelector).toBeInTheDocument()
  })

  it('renders total size', async () => {
    setup()
    render(<BundleSummary />, { wrapper })

    const totalSize = await screen.findByText(/Total size/)
    expect(totalSize).toBeInTheDocument()
  })

  it('renders gzip', async () => {
    setup()
    render(<BundleSummary />, { wrapper })

    const gzipSize = await screen.findByText(/gzip size/)
    expect(gzipSize).toBeInTheDocument()
  })

  it('renders download time', async () => {
    setup()
    render(<BundleSummary />, { wrapper })

    const downloadTime = await screen.findByText(/Download time/)
    expect(downloadTime).toBeInTheDocument()
  })

  it('renders modules', async () => {
    setup()
    render(<BundleSummary />, { wrapper })

    const modules = await screen.findByText(/Modules/)
    expect(modules).toBeInTheDocument()
  })
})
