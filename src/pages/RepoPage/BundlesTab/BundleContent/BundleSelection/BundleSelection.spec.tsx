import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleSelection from './BundleSelection'

const mockRepoOverview = {
  __typename: 'Repository',
  private: false,
  defaultBranch: 'main',
  oldestCommitAt: '2022-10-10T11:59:59',
  coverageEnabled: true,
  bundleAnalysisEnabled: true,
  languages: [],
  testAnalyticsEnabled: true,
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

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles/test-branch'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/bundles/:branch/:bundle',
              '/:provider/:owner/:repo/bundles/:branch',
              '/:provider/:owner/:repo/bundles/',
            ]}
          >
            <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
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

describe('BundleSelection', () => {
  function setup() {
    const user = userEvent.setup()

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

    return { user }
  }

  it('renders branch selector', async () => {
    setup()
    render(<BundleSelection />, { wrapper: wrapper() })

    const branchSelector = await screen.findByRole('button', {
      name: 'bundle branch selector',
    })
    expect(branchSelector).toBeInTheDocument()
  })

  it('renders bundle selector', async () => {
    setup()
    render(<BundleSelection />, { wrapper: wrapper() })

    const bundleSelector = await screen.findByRole('button', {
      name: 'bundle tab bundle selector',
    })
    expect(bundleSelector).toBeInTheDocument()
  })

  describe('user interacts with branch and bundle selectors', () => {
    describe('user selects a branch', () => {
      it('resets the bundle selector', async () => {
        const { user } = setup()
        render(<BundleSelection />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/main/bundle1'),
        })

        const bundleSelector = await screen.findByRole('button', {
          name: 'bundle tab bundle selector',
        })
        expect(bundleSelector).toHaveTextContent(/bundle1/)

        const branchSelector = await screen.findByRole('button', {
          name: 'bundle branch selector',
        })
        await user.click(branchSelector)

        const newBranch = await screen.findByText('branch-1')
        await user.click(newBranch)

        await waitFor(() =>
          expect(bundleSelector).toHaveTextContent(/Select bundle/)
        )
      })
    })
  })
})
