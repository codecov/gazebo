import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { RepoBreadcrumbProvider } from 'pages/RepoPage/context'

import CommitPage from './CommitDetailPage'

vi.mock('ui/TruncatedMessage/hooks')
vi.mock('./Header', () => ({ default: () => 'Header' }))
vi.mock('./CommitCoverage', () => ({ default: () => 'CommitCoverage' }))
vi.mock('./CommitBundleAnalysis', () => ({
  default: () => 'CommitBundleAnalysis',
}))

const mockNotFoundCommit = {
  owner: {
    isCurrentUserPartOfOrg: false,
    repository: {
      __typename: 'Repository',
      private: null,
      bundleAnalysisEnabled: null,
      coverageEnabled: null,
      commit: null,
    },
  },
}

const mockCommitPageData = ({
  coverageEnabled = true,
  bundleAnalysisEnabled = false,
}: {
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
}) => ({
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      private: true,
      bundleAnalysisEnabled,
      coverageEnabled,
      commit: {
        commitid: 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
        compareWithParent: {
          __typename: 'Comparison',
        },
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
          },
        },
      },
    },
  },
})

const mockCoverageDropdownSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          patchTotals: {
            missesCount: 0,
            partialsCount: 0,
          },
        },
      },
    },
  },
}

const mockBundleDropdownSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
            bundleChange: {
              loadTime: {
                threeG: 2,
              },
              size: {
                uncompress: 10000,
              },
            },
          },
        },
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper =
  (
    initialEntries = '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo/commit/:commit">
          <RepoBreadcrumbProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </RepoBreadcrumbProvider>
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

interface SetupArgs {
  notFoundCommit?: boolean
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
}

describe('CommitDetailPage', () => {
  function setup(
    {
      notFoundCommit = false,
      coverageEnabled = true,
      bundleAnalysisEnabled = false,
    }: SetupArgs = {
      notFoundCommit: false,
      coverageEnabled: true,
      bundleAnalysisEnabled: false,
    }
  ) {
    server.use(
      graphql.query('CommitPageData', (info) => {
        if (notFoundCommit) {
          return HttpResponse.json({ data: mockNotFoundCommit })
        }

        return HttpResponse.json({
          data: mockCommitPageData({
            coverageEnabled,
            bundleAnalysisEnabled,
          }),
        })
      }),
      graphql.query('CommitBADropdownSummary', (info) => {
        return HttpResponse.json({ data: mockBundleDropdownSummary })
      }),
      graphql.query('CommitDropdownSummary', (info) => {
        return HttpResponse.json({ data: mockCoverageDropdownSummary })
      }),
      graphql.query('CommitComponents', (info) => {
        return HttpResponse.json({ data: { owner: null } })
      })
    )
  }

  describe('commit is found, and user is part of org', () => {
    it('renders the header component', async () => {
      setup()
      render(<CommitPage />, { wrapper: wrapper() })

      const header = await screen.findByText(/Header/)
      expect(header).toBeInTheDocument()
    })

    describe('coverage is enabled', () => {
      it('renders the CommitCoverage component', async () => {
        setup()
        render(<CommitPage />, { wrapper: wrapper() })

        const CommitCoverage = await screen.findByText(/CommitCoverage/)
        expect(CommitCoverage).toBeInTheDocument()
      })
    })

    describe('bundle analysis is enabled', () => {
      it('renders the CommitBundleAnalysis component', async () => {
        setup({ bundleAnalysisEnabled: true, coverageEnabled: false })
        render(<CommitPage />, { wrapper: wrapper() })

        const CommitBundleAnalysis =
          await screen.findByText(/CommitBundleAnalysis/)
        expect(CommitBundleAnalysis).toBeInTheDocument()
      })
    })

    describe('bundle analysis and coverage are enabled', () => {
      it('renders the CommitBundleAnalysis and CommitCoverage components', async () => {
        setup({ bundleAnalysisEnabled: true, coverageEnabled: true })
        render(<CommitPage />, { wrapper: wrapper() })

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const bundleReport = await screen.findByText(/Bundle report:/)
        expect(bundleReport).toBeInTheDocument()
      })
    })
  })

  describe('when commit is not found, and user is not part of org', () => {
    it('renders NotFound', async () => {
      setup({ notFoundCommit: true })
      render(<CommitPage />, { wrapper: wrapper() })

      const notFound = await screen.findByText('Not found')
      expect(notFound).toBeInTheDocument()
    })
  })

  describe('dropdown query param is present in the url', () => {
    describe('query param is coverage', () => {
      it('renders the CommitCoverage component', async () => {
        setup({ bundleAnalysisEnabled: true, coverageEnabled: true })
        render(<CommitPage />, {
          wrapper: wrapper(
            '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed?dropdown=coverage'
          ),
        })

        const CommitCoverage = await screen.findByText(/CommitCoverage/)
        expect(CommitCoverage).toBeInTheDocument()
      })
    })

    describe('query param is bundle', () => {
      it('renders the CommitBundleAnalysis component', async () => {
        setup({ bundleAnalysisEnabled: true, coverageEnabled: true })
        render(<CommitPage />, {
          wrapper: wrapper(
            '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed?dropdown=bundle'
          ),
        })

        const CommitBundleAnalysis =
          await screen.findByText(/CommitBundleAnalysis/)
        expect(CommitBundleAnalysis).toBeInTheDocument()
      })
    })
  })
})
