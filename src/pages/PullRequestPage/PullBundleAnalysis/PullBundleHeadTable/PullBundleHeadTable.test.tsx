import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import PullBundleHeadTable, { useTableData } from './PullBundleHeadTable'

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockBranchBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        head: {
          commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: [
                {
                  name: 'bundle1',
                  bundleData: {
                    loadTime: {
                      threeG: 200,
                    },
                    size: {
                      uncompress: 100,
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
}

const mockBranchBundlesEmpty = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        head: {
          commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundles: [],
            },
          },
        },
      },
    },
  },
}

const mockBranchBundlesError = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        head: {
          commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'MissingHeadReport',
              message: 'Missing head report',
            },
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
      suspense: true,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter
    initialEntries={[
      '/gh/test-org/test-repo/commit/e28923f6ed227d37d30c304ecc1cf72c564c75dd',
    ]}
  >
    <Route path="/:provider/:owner/:repo/:commit">
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </QueryClientProvider>
    </Route>
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

interface SetupArgs {
  isEmptyList?: boolean
  isUnknownError?: boolean
}

describe('PullBundleHeadTable', () => {
  function setup(
    { isEmptyList = false, isUnknownError = false }: SetupArgs = {
      isEmptyList: false,
      isUnknownError: false,
    }
  ) {
    const user = userEvent.setup()
    server.use(
      graphql.query('PullBundleHeadList', () => {
        if (isEmptyList) {
          return HttpResponse.json({ data: mockBranchBundlesEmpty })
        } else if (isUnknownError) {
          return HttpResponse.json({ data: mockBranchBundlesError })
        }

        return HttpResponse.json({ data: mockBranchBundles })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockRepoOverview })
      })
    )

    return { user }
  }

  describe('there are bundles present', () => {
    describe('renders header', () => {
      it('renders name column', async () => {
        setup()
        render(<PullBundleHeadTable />, { wrapper })

        const nameColumn = await screen.findByText('Bundle name')
        expect(nameColumn).toBeInTheDocument()
      })

      it('renders current size column', async () => {
        setup()
        render(<PullBundleHeadTable />, { wrapper })

        const currSize = await screen.findByText('Current size')
        expect(currSize).toBeInTheDocument()
      })

      it('renders load time column', async () => {
        setup()
        render(<PullBundleHeadTable />, { wrapper })

        const loadTimeColumn = await screen.findByText(
          'Estimated load time (3G)'
        )
        expect(loadTimeColumn).toBeInTheDocument()
      })
    })

    describe('renders rows', () => {
      it('renders bundle name', async () => {
        setup()
        render(<PullBundleHeadTable />, { wrapper })

        const bundleName = await screen.findByText('bundle1')
        expect(bundleName).toBeInTheDocument()
      })

      it('renders previous size', async () => {
        setup()
        render(<PullBundleHeadTable />, { wrapper })

        const currSize = await screen.findByText('100B')
        expect(currSize).toBeInTheDocument()
      })

      it('renders load time size', async () => {
        setup()
        render(<PullBundleHeadTable />, { wrapper })

        const loadTime = await screen.findByText('200ms')
        expect(loadTime).toBeInTheDocument()
      })
    })
  })

  describe('there are no bundles present', () => {
    it('renders no bundles message', async () => {
      setup({ isEmptyList: true })
      render(<PullBundleHeadTable />, { wrapper })

      const noBundlesMessage = await screen.findByText(
        'No bundles were found in this commit'
      )
      expect(noBundlesMessage).toBeInTheDocument()
    })
  })

  describe('an error type is returned', () => {
    it('renders no bundles message', async () => {
      setup({ isEmptyList: true })
      render(<PullBundleHeadTable />, { wrapper })

      const noBundlesMessage = await screen.findByText(
        'No bundles were found in this commit'
      )
      expect(noBundlesMessage).toBeInTheDocument()
    })
  })
})

describe('useTableData', () => {
  function setup(
    { isEmptyList = false, isUnknownError = false }: SetupArgs = {
      isEmptyList: false,
      isUnknownError: false,
    }
  ) {
    server.use(
      graphql.query('PullBundleHeadList', () => {
        if (isEmptyList) {
          return HttpResponse.json({ data: mockBranchBundlesEmpty })
        } else if (isUnknownError) {
          return HttpResponse.json({ data: mockBranchBundlesError })
        }
        return HttpResponse.json({ data: mockBranchBundles })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockRepoOverview })
      })
    )
  }

  describe('valid bundle data is returned', () => {
    it('creates a table data object', async () => {
      setup()
      const { result } = renderHook(() => useTableData(), { wrapper })

      await waitFor(() =>
        expect(result.current).toStrictEqual([
          {
            name: 'bundle1',
            currSize: 100,
            loadTime: 200,
          },
        ])
      )
    })
  })

  describe('invalid bundle data is returned', () => {
    it('returns an empty list', async () => {
      setup({ isUnknownError: true })
      const { result } = renderHook(() => useTableData(), { wrapper })

      await waitFor(() => expect(result.current).toStrictEqual([]))
    })
  })
})
