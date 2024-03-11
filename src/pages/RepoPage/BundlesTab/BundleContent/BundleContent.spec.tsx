import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import BundleContent from './BundleContent'

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock<{
  newBundleTab: boolean
}>

jest.mock('./BundleSummary', () => () => <div>BundleSummary</div>)

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

const mockBranchBundles = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          commitid: '543a5268dce725d85be7747c0f9b61e9a68dea57',
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundleData: {
              loadTime: { threeG: 200 },
              size: { uncompress: 100 },
            },
            bundles: [
              {
                name: 'bundle1',
                bundleData: {
                  loadTime: { threeG: 100 },
                  size: { uncompress: 50 },
                },
              },
            ],
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

const mockAssets = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundle: {
              assets: [
                {
                  name: 'asset-1',
                  extension: 'js',
                  bundleData: {
                    loadTime: {
                      threeG: 2000,
                      highSpeed: 2000,
                    },
                    size: {
                      uncompress: 3000,
                      gzip: 4000,
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

const mockMissingHeadReportAssets = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
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
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route
            path={[
              '/:provider/:owner/:repo/bundles/:branch/:bundle',
              '/:provider/:owner/:repo/bundles',
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

interface SetupArgs {
  isBundleError?: boolean
  flagValue?: boolean
}

describe('BundleContent', () => {
  function setup({ isBundleError = false, flagValue = false }: SetupArgs) {
    mockedUseFlags.mockReturnValue({ newBundleTab: flagValue })

    server.use(
      graphql.query('BranchBundleSummaryData', (req, res, ctx) => {
        if (isBundleError) {
          return res(ctx.status(200), ctx.data(mockBranchBundlesError))
        }

        return res(ctx.status(200), ctx.data(mockBranchBundles))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      }),
      graphql.query('BundleAssets', (req, res, ctx) => {
        if (isBundleError) {
          return res(ctx.status(200), ctx.data(mockMissingHeadReportAssets))
        }

        return res(ctx.status(200), ctx.data(mockAssets))
      })
    )
  }

  it('sends bundle tab metric to sentry', async () => {
    setup({})
    render(<BundleContent />, { wrapper: wrapper() })

    await waitFor(() =>
      expect(Sentry.metrics.increment).toHaveBeenCalledWith(
        'bundles_tab.bundle_details.visited_page',
        1,
        undefined
      )
    )
  })

  describe('rendering summary section', () => {
    describe('flag is off', () => {
      it('renders the bundle summary', async () => {
        setup({ flagValue: false })
        render(<BundleContent />, { wrapper: wrapper() })

        const report = await screen.findByText(/Report:/)
        expect(report).toBeInTheDocument()
      })
    })

    describe('flag is on', () => {
      it('renders the new bundle summary', async () => {
        setup({ flagValue: true })
        render(<BundleContent />, { wrapper: wrapper() })

        const report = await screen.findByText(/BundleSummary/)
        expect(report).toBeInTheDocument()
      })
    })
  })

  describe('rendering content section', () => {
    describe('flag is on', () => {
      describe('when the bundle type is BundleAnalysisReport', () => {
        it('renders the bundle table', async () => {
          setup({ flagValue: true })
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles/main/test-bundle'),
          })

          const bundleName = await screen.findByText(/asset-1/)
          expect(bundleName).toBeInTheDocument()

          const [type] = await screen.findAllByText('js')
          expect(type).toBeInTheDocument()

          const [bundleSize] = await screen.findAllByText(/3kB/)
          expect(bundleSize).toBeInTheDocument()

          const [bundleLoadTime] = await screen.findAllByText(/2s/)
          expect(bundleLoadTime).toBeInTheDocument()
        })
      })

      describe('when the bundle type is not BundleAnalysisReport', () => {
        it('renders the error banner', async () => {
          setup({ isBundleError: true, flagValue: true })
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles/main/test-bundle'),
          })

          const bannerHeader = await screen.findByText(/Missing Head Report/)
          expect(bannerHeader).toBeInTheDocument()

          const bannerMessage = await screen.findByText(
            'Unable to compare commits because the head of the pull request did not upload a bundle stats file.'
          )
          expect(bannerMessage).toBeInTheDocument()
        })

        it('renders the empty table', async () => {
          setup({ isBundleError: true, flagValue: true })
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles/main/test-bundle'),
          })

          const dashes = await screen.findAllByText('-')
          expect(dashes).toHaveLength(4)
        })
      })
    })

    describe('flag is off', () => {
      describe('when the bundle type is BundleAnalysisReport', () => {
        it('renders the bundle table', async () => {
          setup({})
          render(<BundleContent />, { wrapper: wrapper() })

          const bundleName = await screen.findByText(/bundle1/)
          expect(bundleName).toBeInTheDocument()

          const bundleSize = await screen.findByText(/50B/)
          expect(bundleSize).toBeInTheDocument()

          const bundleLoadTime = await screen.findByText(/100ms/)
          expect(bundleLoadTime).toBeInTheDocument()
        })
      })

      describe('when the bundle type is not BundleAnalysisReport', () => {
        it('renders the error banner', async () => {
          setup({ isBundleError: true })
          render(<BundleContent />, { wrapper: wrapper() })

          const bannerHeader = await screen.findByText(/Missing Head Report/)
          expect(bannerHeader).toBeInTheDocument()

          const bannerMessage = await screen.findByText(
            'Unable to compare commits because the head of the pull request did not upload a bundle stats file.'
          )
          expect(bannerMessage).toBeInTheDocument()
        })

        it('renders the empty table', async () => {
          setup({ isBundleError: true })
          render(<BundleContent />, { wrapper: wrapper() })

          const dashes = await screen.findAllByText('-')
          expect(dashes).toHaveLength(3)
        })
      })
    })
  })
})
