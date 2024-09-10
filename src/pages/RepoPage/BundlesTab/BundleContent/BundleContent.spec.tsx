import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleContent from './BundleContent'

jest.mock('./BundleSelection', () => () => <div>BundleSelection</div>)

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

const mockEmptyBundleSelection = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: null,
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
              bundleData: {
                size: {
                  uncompress: 12,
                },
              },
              assetsPaginated: {
                edges: [
                  {
                    node: {
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
                      measurements: {
                        change: {
                          size: {
                            uncompress: 5,
                          },
                        },
                        measurements: [
                          { timestamp: '2022-10-10T11:59:59', avg: 6 },
                        ],
                      },
                    },
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: null,
                },
              },
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

const mockBundleTrendData = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundle: {
              measurements: [
                {
                  assetType: 'REPORT_SIZE',
                  measurements: [
                    {
                      timestamp: '2024-06-15T00:00:00+00:00',
                      avg: null,
                    },
                    {
                      timestamp: '2024-06-16T00:00:00+00:00',
                      avg: null,
                    },
                    {
                      timestamp: '2024-06-17T00:00:00+00:00',
                      avg: 6834699.8,
                    },
                    {
                      timestamp: '2024-06-18T00:00:00+00:00',
                      avg: 6822037.27273,
                    },
                    {
                      timestamp: '2024-06-19T00:00:00+00:00',
                      avg: 6824833.33333,
                    },
                    {
                      timestamp: '2024-06-20T00:00:00+00:00',
                      avg: 6812341,
                    },
                  ],
                },
              ],
            },
          },
        },
      },
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

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper =
  (
    initialEntries = '/gh/codecov/test-repo/bundles'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route
          path={[
            '/:provider/:owner/:repo/bundles/:branch/:bundle',
            '/:provider/:owner/:repo/bundles/:branch',
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
  isEmptyBundleSelection?: boolean
}

describe('BundleContent', () => {
  function setup({
    isBundleError = false,
    isEmptyBundleSelection = false,
  }: SetupArgs) {
    server.use(
      graphql.query('BranchBundleSummaryData', (req, res, ctx) => {
        if (isBundleError) {
          return res(ctx.status(200), ctx.data(mockBranchBundlesError))
        } else if (isEmptyBundleSelection) {
          return res(ctx.status(200), ctx.data(mockEmptyBundleSelection))
        }
        return res(ctx.status(200), ctx.data(mockBranchBundles))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      }),
      graphql.query('PagedBundleAssets', (req, res, ctx) => {
        if (isBundleError) {
          return res(ctx.status(200), ctx.data(mockMissingHeadReportAssets))
        }

        return res(ctx.status(200), ctx.data(mockAssets))
      }),
      graphql.query('GetBundleTrend', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBundleTrendData))
      }),
      graphql.query('BundleSummary', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBundleSummary))
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

  describe('rendering select section', () => {
    it('renders the bundle summary', async () => {
      setup({})
      render(<BundleContent />, { wrapper: wrapper() })

      const report = await screen.findByText(/BundleSelection/)
      expect(report).toBeInTheDocument()
    })
  })

  describe('rendering content section', () => {
    describe('when the bundle type is BundleAnalysisReport', () => {
      describe('when branch and bundle are set', () => {
        it('renders the bundle table', async () => {
          setup({})
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles/main/test-bundle'),
          })

          const bundleName = await screen.findByText('asset-1')
          expect(bundleName).toBeInTheDocument()

          const [type] = await screen.findAllByText('js')
          expect(type).toBeInTheDocument()

          const [bundleSize] = await screen.findAllByText(/3kB/)
          expect(bundleSize).toBeInTheDocument()

          const [bundleLoadTime] = await screen.findAllByText(/2s/)
          expect(bundleLoadTime).toBeInTheDocument()
        })

        describe('rendering bundle details', () => {
          it('has correct total size', async () => {
            setup({})
            render(<BundleContent />, {
              wrapper: wrapper(
                '/gh/codecov/test-repo/bundles/main/test-bundle'
              ),
            })

            const totalSize = await screen.findByText(/2kB/)
            expect(totalSize).toBeInTheDocument()
          })

          it('has correct gzip size', async () => {
            setup({})
            render(<BundleContent />, {
              wrapper: wrapper(
                '/gh/codecov/test-repo/bundles/main/test-bundle'
              ),
            })

            const gzipSize = await screen.findByText(/1kB/)
            expect(gzipSize).toBeInTheDocument()
          })

          it('has correct download time', async () => {
            setup({})
            render(<BundleContent />, {
              wrapper: wrapper(
                '/gh/codecov/test-repo/bundles/main/test-bundle'
              ),
            })

            const downloadTime = await screen.findByText(/1,000ms/)
            expect(downloadTime).toBeInTheDocument()
          })

          it('has correct module count', async () => {
            setup({})
            render(<BundleContent />, {
              wrapper: wrapper(
                '/gh/codecov/test-repo/bundles/main/test-bundle'
              ),
            })

            const moduleCount = await screen.findByText(/10/)
            expect(moduleCount).toBeInTheDocument()
          })
        })
      })

      describe('when only the branch is set', () => {
        it('renders no bundle selected banner and empty table', async () => {
          setup({})
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles/main'),
          })

          const banner = await screen.findByText(/No Bundle Selected/)
          expect(banner).toBeInTheDocument()

          const dashes = await screen.findAllByText('-')
          // has length 8 because bundle details being moved to this component
          expect(dashes).toHaveLength(8)
        })
      })

      describe('when bundle and branch are not set', () => {
        it('renders no branch selected banner and empty table', async () => {
          setup({})
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles'),
          })

          const banner = await screen.findByText(/No Branch Selected/)
          expect(banner).toBeInTheDocument()

          const dashes = await screen.findAllByText('-')
          // has length 8 because bundle details being moved to this component
          expect(dashes).toHaveLength(8)
        })
      })
    })

    describe('bundle type is MissingHeadReport', () => {
      it('renders the error banner', async () => {
        setup({ isBundleError: true })
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
        setup({ isBundleError: true })
        render(<BundleContent />, {
          wrapper: wrapper('/gh/codecov/test-repo/bundles/main/test-bundle'),
        })

        const dashes = await screen.findAllByText('-')
        expect(dashes).toHaveLength(4)
      })
    })

    describe('when the bundle type is not BundleAnalysisReport', () => {
      describe('there is no branch data and no branch set', () => {
        it('renders the info banner', async () => {
          setup({ isEmptyBundleSelection: true })
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles'),
          })

          const bannerHeader = await screen.findByText(/No Branch Selected/)
          expect(bannerHeader).toBeInTheDocument()

          const bannerMessage = await screen.findByText(
            'Please select a branch to view the list of bundles.'
          )
          expect(bannerMessage).toBeInTheDocument()
        })

        it('renders the empty table', async () => {
          setup({ isEmptyBundleSelection: true })
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles'),
          })

          const dashes = await screen.findAllByText('-')
          // has length 8 because bundle details being moved to this component
          expect(dashes).toHaveLength(8)
        })
      })

      describe('there is a set branch but unknown bundle type', () => {
        it('renders the error banner', async () => {
          setup({ isEmptyBundleSelection: true })
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles/main'),
          })

          const bannerHeader = await screen.findByText(/Unknown Error/)
          expect(bannerHeader).toBeInTheDocument()

          const bannerMessage = await screen.findByText(
            'An unknown error occurred while trying to load the bundle analysis reports.'
          )
          expect(bannerMessage).toBeInTheDocument()
        })

        it('renders the empty table', async () => {
          setup({ isEmptyBundleSelection: true })
          render(<BundleContent />, {
            wrapper: wrapper('/gh/codecov/test-repo/bundles/main'),
          })

          const dashes = await screen.findAllByText('-')
          // has length 8 because bundle details being moved to this component
          expect(dashes).toHaveLength(8)
        })
      })
    })
  })
})
