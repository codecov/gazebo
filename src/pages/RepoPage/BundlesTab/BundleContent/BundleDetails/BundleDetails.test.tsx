import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { BundleDetails } from './BundleDetails'

const mockRepoOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockBundleSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundle: {
                name: 'bundle1',
                moduleCount: 10,
                bundleData: {
                  loadTime: {
                    threeG: 1000,
                    highSpeed: 500,
                  },
                  size: {
                    gzip: 1000,
                    uncompress: 2000,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

const mockNoSummary = { owner: null }

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles/test-branch/test-bundle'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
            <Suspense fallback={null}>{children}</Suspense>
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

interface SetupArgs {
  noSummary?: boolean
}

describe('BundleDetails', () => {
  function setup({ noSummary = false }: SetupArgs) {
    const queryVars = vi.fn()

    server.use(
      graphql.query('BundleSummary', (info) => {
        if (noSummary) {
          return HttpResponse.json({ data: mockNoSummary })
        }

        if (info.variables) {
          queryVars(info.variables)
        }
        return HttpResponse.json({ data: mockBundleSummary })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockRepoOverview })
      })
    )

    return { queryVars }
  }

  describe('there is summary data', () => {
    describe('rendering titles', () => {
      it('renders total size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const totalSize = await screen.findByText('Total size')
        expect(totalSize).toBeInTheDocument()
      })

      it('renders gzip size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const gzipSize = await screen.findByText('gzip size (est.)')
        expect(gzipSize).toBeInTheDocument()
      })

      it('renders download time', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const downloadTime = await screen.findByText('Download time (est.)')
        expect(downloadTime).toBeInTheDocument()
      })

      it('renders modules', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const modules = await screen.findByText('Modules')
        expect(modules).toBeInTheDocument()
      })
    })

    describe('rendering details', () => {
      it('renders total size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const totalSize = await screen.findByText('2kB')
        expect(totalSize).toBeInTheDocument()
      })

      it('renders gzip size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const gzipSize = await screen.findByText('1kB')
        expect(gzipSize).toBeInTheDocument()
      })

      it('renders download time', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const downloadTime = await screen.findByText(/1,000ms | 500ms/)
        expect(downloadTime).toBeInTheDocument()

        const downloadTimeBreakdown =
          await screen.findByText(/(3G | high speed)/)
        expect(downloadTimeBreakdown).toBeInTheDocument()
      })

      it('renders modules', async () => {
        setup({})
        render(<BundleDetails />, { wrapper: wrapper() })

        const modules = await screen.findByText('10')
        expect(modules).toBeInTheDocument()
      })
    })
  })

  describe('there is no summary data', () => {
    describe('rendering titles', () => {
      it('renders total size', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper: wrapper() })

        const totalSize = await screen.findByText('Total size')
        expect(totalSize).toBeInTheDocument()
      })

      it('renders gzip size', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper: wrapper() })

        const gzipSize = await screen.findByText('gzip size (est.)')
        expect(gzipSize).toBeInTheDocument()
      })

      it('renders download time', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper: wrapper() })

        const downloadTime = await screen.findByText('Download time (est.)')
        expect(downloadTime).toBeInTheDocument()
      })

      it('renders modules', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper: wrapper() })

        const modules = await screen.findByText('Modules')
        expect(modules).toBeInTheDocument()
      })
    })

    describe('rendering details', () => {
      it('renders four dashes', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper: wrapper() })

        const dashes = await screen.findAllByText('-')
        expect(dashes).toHaveLength(4)
      })
    })
  })

  it('passes through url params when present', async () => {
    const { queryVars } = setup({})
    const url = `/gh/codecov/test-repo/bundles/test-branch/test-bundle?${qs.stringify(
      { types: ['JAVASCRIPT'] }
    )}`
    render(<BundleDetails />, { wrapper: wrapper(url) })

    await waitFor(() =>
      expect(queryVars).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { loadTypes: [], reportGroups: ['JAVASCRIPT'] },
        })
      )
    )
  })
})
