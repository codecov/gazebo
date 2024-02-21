import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleSummaryOld from './BundleSummaryOld'

const mockRepoOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['javascript'],
    },
  },
}

const mockUnknownError = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: null,
    },
  },
}

const mockBranchBundles = (
  commitid: string | null = '543a5268dce725d85be7747c0f9b61e9a68dea57'
) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          commitid,
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            sizeTotal: 100,
            loadTimeTotal: 200,
            bundles: [{ name: 'bundle1', sizeTotal: 50, loadTimeTotal: 100 }],
          },
        },
      },
    },
  },
})

const mockBranchBundlesError = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
          bundleAnalysisReport: {
            __typename: 'MissingHeadReport',
            message: 'Missing head report',
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
      <Route path="/:provider/:owner/:repo/bundles">
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

interface SetupArgs {
  hasBranchBundleError?: boolean
  hasCommitId?: boolean
  isUnknownError?: boolean
}

describe('BundleSummaryOld', () => {
  function setup({
    hasBranchBundleError = false,
    hasCommitId = true,
    isUnknownError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('BranchBundleSummaryData', (req, res, ctx) => {
        if (hasBranchBundleError) {
          return res(ctx.status(200), ctx.data(mockBranchBundlesError))
        } else if (isUnknownError) {
          return res(ctx.status(200), ctx.data(mockUnknownError))
        }

        let data = mockBranchBundles()
        if (!hasCommitId) {
          data = mockBranchBundles(null)
        }

        return res(ctx.status(200), ctx.data(data))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      })
    )
  }

  describe('there is a bundle report', () => {
    it('renders the bundle summary message', async () => {
      setup({})
      render(<BundleSummaryOld />, { wrapper })

      const report = await screen.findByText(/Report:/)
      expect(report).toBeInTheDocument()

      const totalSize = await screen.findByText(
        /total combined bundle size 100B/
      )
      expect(totalSize).toBeInTheDocument()
    })

    it('renders link to the commit page', async () => {
      setup({})
      render(<BundleSummaryOld />, { wrapper })

      const source = await screen.findByText(/Source:/)
      expect(source).toBeInTheDocument()

      const latestCommit = await screen.findByText(/latest commit/)
      expect(latestCommit).toBeInTheDocument()

      const commitLink = await screen.findByRole('link', {
        name: '543a526',
      })
      expect(commitLink).toBeInTheDocument()
      expect(commitLink).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/543a5268dce725d85be7747c0f9b61e9a68dea57'
      )
    })
  })

  describe('there is a known error', () => {
    it('renders the known error message', async () => {
      setup({ hasBranchBundleError: true })
      render(<BundleSummaryOld />, { wrapper })

      const report = await screen.findByText(/Report:/)
      expect(report).toBeInTheDocument()

      const message = await screen.findByText(/missing head report/)
      expect(message).toBeInTheDocument()
    })

    it('renders the link to the commit page', async () => {
      setup({ hasBranchBundleError: true })
      render(<BundleSummaryOld />, { wrapper })

      const source = await screen.findByText(/Source:/)
      expect(source).toBeInTheDocument()

      const latestCommit = await screen.findByText(/latest commit/)
      expect(latestCommit).toBeInTheDocument()

      const commitLink = await screen.findByRole('link', {
        name: '543a526',
      })
      expect(commitLink).toBeInTheDocument()
      expect(commitLink).toHaveAttribute(
        'href',
        '/gh/codecov/test-repo/commit/543a5268dce725d85be7747c0f9b61e9a68dea57'
      )
    })
  })

  describe('there is an unknown error', () => {
    it('renders the unknown error message', async () => {
      setup({ isUnknownError: true })
      render(<BundleSummaryOld />, { wrapper })

      const report = await screen.findByText(/Report:/)
      expect(report).toBeInTheDocument()

      const message = await screen.findByText(/an unknown error has occurred/)
      expect(message).toBeInTheDocument()
    })
  })
})
