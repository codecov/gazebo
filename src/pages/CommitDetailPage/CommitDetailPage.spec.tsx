import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CommitPage from './CommitDetailPage'

jest.mock('ui/TruncatedMessage/hooks')
jest.mock('./Header', () => () => 'Header')
jest.mock('./CommitCoverage', () => () => 'CommitCoverage')
jest.mock('./CommitBundleAnalysis', () => () => 'CommitBundleAnalysis')

const mockNotFoundCommit = {
  owner: {
    isCurrentUserPartOfOrg: false,
    repository: {
      __typename: 'Repository',
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
      bundleAnalysisEnabled,
      coverageEnabled,
      commit: {
        commitid: 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
        compareWithParent: {
          __typename: 'Comparison',
        },
        bundleAnalysisCompareWithParent: {
          __typename: 'BundleAnalysisComparison',
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
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper =
  (
    initialEntries = '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/commit/:commit">
            <Suspense fallback={null}>{children}</Suspense>
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
      graphql.query('CommitPageData', (req, res, ctx) => {
        if (notFoundCommit) {
          return res(ctx.status(200), ctx.data(mockNotFoundCommit))
        }

        return res(
          ctx.status(200),
          ctx.data(
            mockCommitPageData({
              coverageEnabled,
              bundleAnalysisEnabled,
            })
          )
        )
      }),
      graphql.query('CommitBADropdownSummary', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBundleDropdownSummary))
      }),
      graphql.query('CommitDropdownSummary', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockCoverageDropdownSummary))
      }),
      graphql.query('CommitComponents', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ owner: null }))
      })
    )
  }

  describe('commit is found, and user is part of org', () => {
    describe('renders the breadcrumb', () => {
      it('renders owner crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper: wrapper() })

        const ownerCrumb = await screen.findByRole('link', { name: 'test-org' })
        expect(ownerCrumb).toBeInTheDocument()
        expect(ownerCrumb).toHaveAttribute('href', '/gh/test-org')
      })

      it('renders repo crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper: wrapper() })

        const repoCrumb = await screen.findByRole('link', { name: 'test-repo' })
        expect(repoCrumb).toBeInTheDocument()
        expect(repoCrumb).toHaveAttribute('href', '/gh/test-org/test-repo')
      })

      it('renders commits crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper: wrapper() })

        const commitsCrumb = await screen.findByRole('link', {
          name: 'commits',
        })
        expect(commitsCrumb).toBeInTheDocument()
        expect(commitsCrumb).toHaveAttribute(
          'href',
          '/gh/test-org/test-repo/commits'
        )
      })

      it('renders commit sha crumb', async () => {
        setup()
        render(<CommitPage />, { wrapper: wrapper() })

        const shortSha = 'e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed'.slice(0, 7)
        const commitShaCrumb = await screen.findByText(shortSha)
        expect(commitShaCrumb).toBeInTheDocument()
      })
    })

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

        const CommitBundleAnalysis = await screen.findByText(
          /CommitBundleAnalysis/
        )
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

        const CommitBundleAnalysis = await screen.findByText(
          /CommitBundleAnalysis/
        )
        expect(CommitBundleAnalysis).toBeInTheDocument()
      })
    })
  })
})
