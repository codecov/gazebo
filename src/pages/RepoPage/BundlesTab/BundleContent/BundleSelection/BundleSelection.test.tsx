import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleSelection from './BundleSelection'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ displayBundleCachingModal: true }),
}))

vi.mock('shared/featureFlags', () => ({
  useFlags: mocks.useFlags,
}))

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
      { node: { name: 'branch-1', head: { commitid: 'asdf123' } } },
      { node: { name: 'main', head: { commitid: '321fdsa' } } },
    ],
    pageInfo: { hasNextPage: false, endCursor: 'end-cursor' },
  },
}

const mockBranchBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: [{ name: 'bundle1' }, { name: 'bundle2' }],
            },
          },
        },
      },
    },
  },
}

const mockCachedBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: [
                { name: 'bundle1', isCached: true },
                { name: 'bundle2', isCached: false },
              ],
            },
          },
        },
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles/test-branch'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
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
            <Toaster />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('BundleSelection', () => {
  function setup() {
    const user = userEvent.setup()

    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isCurrentUserActivated: true,
              repository: mockRepoOverview,
            },
          },
        })
      }),
      graphql.query('GetBranch', () => {
        return HttpResponse.json({
          data: {
            owner: {
              repository: { __typename: 'Repository', ...mockBranch },
            },
          },
        })
      }),
      graphql.query('GetBranches', () => {
        return HttpResponse.json({
          data: { owner: { repository: mockBranches } },
        })
      }),
      graphql.query('BranchBundlesNames', () => {
        return HttpResponse.json({ data: mockBranchBundles })
      }),
      graphql.query('CachedBundleList', () => {
        return HttpResponse.json({ data: mockCachedBundles })
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

  it('renders type selector', async () => {
    setup()
    render(<BundleSelection />, { wrapper: wrapper() })

    const typeSelector = await screen.findByRole('button', {
      name: 'bundle tab types selector',
    })
    expect(typeSelector).toBeInTheDocument()
  })

  it('renders loading selector', async () => {
    setup()
    render(<BundleSelection />, { wrapper: wrapper() })

    const loadSelector = await screen.findByRole('button', {
      name: 'bundle tab loading selector',
    })
    expect(loadSelector).toBeInTheDocument()
  })

  it('renders bundle caching button', async () => {
    setup()
    render(<BundleSelection />, { wrapper: wrapper() })

    const bundleCachingButton = await screen.findByRole('button', {
      name: 'Configure data caching',
    })
    expect(bundleCachingButton).toBeInTheDocument()
  })

  describe('user interacts with branch and bundle selectors', () => {
    describe('user selects a branch', () => {
      it('resets the bundle selector to the first available bundle', async () => {
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

        const branch1 = await screen.findByRole('option', {
          name: 'branch-1',
        })
        await user.click(branch1)

        await waitFor(() => expect(bundleSelector).toHaveTextContent(/bundle1/))
      })

      it('resets the type selector', async () => {
        const { user } = setup()
        render(<BundleSelection />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/main/bundle1'),
        })

        const typeSelector = await screen.findByRole('button', {
          name: 'bundle tab types selector',
        })
        await user.click(typeSelector)

        const type = await screen.findByRole('option', {
          name: 'JavaScript',
        })
        await user.click(type)

        const bundleSelector = await screen.findByRole('button', {
          name: 'bundle tab bundle selector',
        })
        await user.click(bundleSelector)

        const bundle2 = await screen.findByRole('option', {
          name: 'bundle2',
        })
        await user.click(bundle2)

        const updatedTypeSelector = await screen.findByRole('button', {
          name: 'bundle tab types selector',
        })
        await waitFor(() =>
          expect(updatedTypeSelector).toHaveTextContent('All types')
        )
      })

      it('resets the loading selector', async () => {
        const { user } = setup()
        render(<BundleSelection />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/main/bundle1'),
        })

        const loadingSelector = await screen.findByRole('button', {
          name: 'bundle tab loading selector',
        })
        await user.click(loadingSelector)

        const type = await screen.findByRole('option', {
          name: 'Initial files',
        })
        await user.click(type)

        const bundleSelector = await screen.findByRole('button', {
          name: 'bundle tab bundle selector',
        })
        await user.click(bundleSelector)

        const bundle2 = await screen.findByRole('option', {
          name: 'bundle2',
        })
        await user.click(bundle2)

        const updatedLoadingSelector = await screen.findByRole('button', {
          name: 'bundle tab loading selector',
        })
        await waitFor(() =>
          expect(updatedLoadingSelector).toHaveTextContent('All load types')
        )
      })
    })
  })

  describe('user clicks bundle caching button', () => {
    it('renders bundle caching modal', async () => {
      const { user } = setup()
      render(<BundleSelection />, { wrapper: wrapper() })

      const bundleCachingButton = await screen.findByRole('button', {
        name: 'Configure data caching',
      })
      await user.click(bundleCachingButton)

      const modalHeader = await screen.findByText(
        'Configure bundle caching data'
      )
      expect(modalHeader).toBeInTheDocument()
    })
  })
})
