import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleDetails from './BundleDetails'

const mockRepoOverview = {
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: false,
      bundleAnalysisEnabled: false,
      languages: ['javascript'],
    },
  },
}

const mockBundleSummary = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundle: {
              name: 'bundle1',
              moduleCount: 10,
              sizeTotal: 1000,
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
}

const mockNoSummary = { owner: null }

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={[
        '/gh/codecov/test.-repo/bundles/test.-branch/test.-bundle',
      ]}
    >
      <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
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
  noSummary?: boolean
}

describe('BundleDetails', () => {
  function setup({ noSummary = false }: SetupArgs) {
    server.use(
      graphql.query('BundleSummary', (req, res, ctx) => {
        if (noSummary) {
          return res(ctx.status(200), ctx.data(mockNoSummary))
        }
        return res(ctx.status(200), ctx.data(mockBundleSummary))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      })
    )
  }

  describe('there is summary data', () => {
    describe('rendering titles', () => {
      it('renders total size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const totalSize = await screen.findByText('Total size')
        expect(totalSize).toBeInTheDocument()
      })

      it('renders gzip size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const gzipSize = await screen.findByText('gzip size (est.)')
        expect(gzipSize).toBeInTheDocument()
      })

      it('renders download time', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const downloadTime = await screen.findByText('Download time (est.)')
        expect(downloadTime).toBeInTheDocument()
      })

      it('renders modules', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const modules = await screen.findByText('Modules')
        expect(modules).toBeInTheDocument()
      })
    })

    describe('rendering details', () => {
      it('renders total size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const totalSize = await screen.findByText('2kB')
        expect(totalSize).toBeInTheDocument()
      })

      it('renders gzip size', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const gzipSize = await screen.findByText('1kB')
        expect(gzipSize).toBeInTheDocument()
      })

      it('renders download time', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const downloadTime = await screen.findByText(/1,000ms | 500ms/)
        expect(downloadTime).toBeInTheDocument()

        const downloadTimeBreakdown = await screen.findByText(
          /(3G | high speed)/
        )
        expect(downloadTimeBreakdown).toBeInTheDocument()
      })

      it('renders modules', async () => {
        setup({})
        render(<BundleDetails />, { wrapper })

        const modules = await screen.findByText('10')
        expect(modules).toBeInTheDocument()
      })
    })
  })

  describe('there is no summary data', () => {
    describe('rendering titles', () => {
      it('renders total size', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper })

        const totalSize = await screen.findByText('Total size')
        expect(totalSize).toBeInTheDocument()
      })

      it('renders gzip size', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper })

        const gzipSize = await screen.findByText('gzip size (est.)')
        expect(gzipSize).toBeInTheDocument()
      })

      it('renders download time', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper })

        const downloadTime = await screen.findByText('Download time (est.)')
        expect(downloadTime).toBeInTheDocument()
      })

      it('renders modules', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper })

        const modules = await screen.findByText('Modules')
        expect(modules).toBeInTheDocument()
      })
    })

    describe('rendering details', () => {
      it('renders four dashes', async () => {
        setup({ noSummary: true })
        render(<BundleDetails />, { wrapper })

        const dashes = await screen.findAllByText('-')
        expect(dashes).toHaveLength(4)
      })
    })
  })
})
