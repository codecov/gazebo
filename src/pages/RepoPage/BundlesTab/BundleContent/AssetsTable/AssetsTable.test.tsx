import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { mockIsIntersecting } from 'react-intersection-observer/test-utils'
import { MemoryRouter, Route } from 'react-router-dom'

import { AssetsTable, ChangeOverTime } from './AssetsTable'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({ renderBundleFilePathColumn: true }),
}))

vi.mock('shared/featureFlags', async () => {
  const original = await vi.importActual('shared/featureFlags')
  return {
    ...original,
    useFlags: mocks.useFlags,
  }
})

const mockAssets = ({
  hasNextPage = true,
  pluginName = '@codecov/vite-plugin',
}: {
  hasNextPage?: boolean
  pluginName?: string
}) => {
  const asset1 = {
    name: 'asset-1',
    routes: ['/'],
    extension: 'js',
    bundleData: {
      loadTime: { threeG: 2000, highSpeed: 2000 },
      size: { uncompress: 4000, gzip: 400 },
    },
    measurements: {
      change: { size: { uncompress: 5 } },
      measurements: [
        { timestamp: '2022-10-10T11:59:59', avg: 6 },
        { timestamp: '2022-10-11T11:59:59', avg: null },
      ],
    },
  }

  const asset2 = {
    name: 'asset-2',
    routes: ['/about'],
    extension: 'js',
    bundleData: {
      loadTime: { threeG: 2000, highSpeed: 2000 },
      size: { uncompress: 2000, gzip: 200 },
    },
    measurements: {
      change: { size: { uncompress: -5 } },
      measurements: [
        { timestamp: '2022-10-10T11:59:59', avg: 6 },
        { timestamp: '2022-10-11T11:59:59', avg: null },
      ],
    },
  }

  const asset3 = {
    name: 'asset-3',
    routes: ['/login'],
    extension: 'js',
    bundleData: {
      loadTime: { threeG: 2000, highSpeed: 2000 },
      size: { uncompress: 2000, gzip: 200 },
    },
    measurements: null,
  }

  return {
    owner: {
      repository: {
        __typename: 'Repository',
        branch: {
          head: {
            bundleAnalysis: {
              bundleAnalysisReport: {
                __typename: 'BundleAnalysisReport',
                bundle: {
                  info: { pluginName },
                  bundleData: { size: { uncompress: 6000 } },
                  assetsPaginated: {
                    edges: [
                      { node: asset1 },
                      ...(hasNextPage
                        ? [{ node: asset2 }, { node: asset3 }]
                        : []),
                    ],
                    pageInfo: {
                      hasNextPage: hasNextPage,
                      endCursor: hasNextPage
                        ? 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA'
                        : null,
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
}

const mockBundleAssetModules = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundle: {
                info: { pluginName: '@codecov/vite-plugin' },
                bundleData: { size: { uncompress: 12 } },
                asset: { modules: [] },
              },
            },
          },
        },
      },
    },
  },
}

const mockEmptyAssets = (pluginName: string) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundle: {
                info: { pluginName },
                bundleData: { size: { uncompress: 12 } },
                assetsPaginated: {
                  edges: [],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              },
            },
          },
        },
      },
    },
  },
})

const mockMissingHeadReport = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
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

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={[
          '/gh/codecov/test-repo/bundles/test-branch/test-bundle',
        ]}
      >
        <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
          <Suspense fallback={<div>Loading</div>}>{children}</Suspense>
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
  isEmptyBundles?: boolean
  isMissingHeadReport?: boolean
  multipleAssets?: boolean
  pluginName?: string
}

describe('AssetsTable', () => {
  function setup({
    isEmptyBundles = false,
    isMissingHeadReport = false,
    multipleAssets = true,
    pluginName = '@codecov/vite-plugin',
  }: SetupArgs) {
    const user = userEvent.setup()
    const mockOrdering = vi.fn()
    const mockOrderingDirection = vi.fn()

    server.use(
      graphql.query('BundleAssets', (info) => {
        if (isEmptyBundles) {
          return HttpResponse.json({ data: mockEmptyAssets(pluginName) })
        } else if (isMissingHeadReport) {
          return HttpResponse.json({ data: mockMissingHeadReport })
        }

        if (info.variables?.ordering) {
          mockOrdering(info.variables.ordering)
        }

        if (info.variables?.orderingDirection) {
          mockOrderingDirection(info.variables.orderingDirection)
        }

        if (multipleAssets && info.variables?.after) {
          multipleAssets = true
        }

        return HttpResponse.json({
          data: mockAssets({ hasNextPage: multipleAssets, pluginName }),
        })
      }),
      graphql.query('BundleAssetModules', () => {
        return HttpResponse.json({ data: mockBundleAssetModules })
      }),
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockRepoOverview })
      })
    )

    return { user, mockOrdering, mockOrderingDirection }
  }

  describe('there is no data', () => {
    describe('non-file path plugin', () => {
      it('renders the empty table with 5 dashes', async () => {
        setup({ isEmptyBundles: true })
        render(<AssetsTable />, { wrapper })

        const tableRoles = await screen.findAllByRole('row')
        expect(tableRoles).toHaveLength(2)

        const tableCells = await within(tableRoles[1]!).findAllByRole('cell')
        expect(tableCells).toHaveLength(5)
        tableCells.forEach((cell) => {
          expect(cell).toHaveTextContent('-')
        })
      })
    })

    describe('file path plugin', () => {
      it('renders the empty table with 6 dashes', async () => {
        setup({ isEmptyBundles: true, pluginName: '@codecov/sveltekit-plugin' })
        render(<AssetsTable />, { wrapper })

        const tableRoles = await screen.findAllByRole('row')
        expect(tableRoles).toHaveLength(2)

        const tableCells = await within(tableRoles[1]!).findAllByRole('cell')
        expect(tableCells).toHaveLength(6)
        tableCells.forEach((cell) => {
          expect(cell).toHaveTextContent('-')
        })
      })
    })
  })

  describe('there are no assets', () => {
    it('renders the empty table', async () => {
      setup({ isMissingHeadReport: true })
      render(<AssetsTable />, { wrapper })

      const tableRoles = await screen.findAllByRole('row')
      expect(tableRoles).toHaveLength(2)

      const tableCells = await within(tableRoles[1]!).findAllByRole('cell')
      expect(tableCells).toHaveLength(5)
      tableCells.forEach((cell) => {
        expect(cell).toHaveTextContent('-')
      })
    })
  })

  describe('there is data and assets', () => {
    describe('renders table head', () => {
      it('renders asset column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const asset = await screen.findByText('Asset')
        expect(asset).toBeInTheDocument()
      })

      describe('file path plugin', () => {
        it('renders file path column', async () => {
          setup({ pluginName: '@codecov/sveltekit-plugin' })
          render(<AssetsTable />, { wrapper })

          const filePath = await screen.findByText('File path')
          expect(filePath).toBeInTheDocument()
        })
      })

      it('renders load time column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const loadTime = await screen.findByText('Est. load time (3G)')
        expect(loadTime).toBeInTheDocument()
      })

      it('renders size column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const size = await screen.findByText('Size')
        expect(size).toBeInTheDocument()
      })

      it('renders change over time column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const changeOverTime = await screen.findByText('Change over time')
        expect(changeOverTime).toBeInTheDocument()
      })
    })

    describe('renders table rows', () => {
      it('renders asset column', async () => {
        setup({ multipleAssets: false })
        render(<AssetsTable />, { wrapper })

        const asset = await screen.findByText('asset-1')
        expect(asset).toBeInTheDocument()
      })

      describe('file path plugin', () => {
        it('renders file path column', async () => {
          setup({ pluginName: '@codecov/sveltekit-plugin' })
          render(<AssetsTable />, { wrapper })

          const filePath = await screen.findByText('/login')
          expect(filePath).toBeInTheDocument()
        })
      })

      it('renders type column', async () => {
        setup({ multipleAssets: false })
        render(<AssetsTable />, { wrapper })

        const [type] = await screen.findAllByText('js')
        expect(type).toBeInTheDocument()
      })

      it('renders load time column', async () => {
        setup({ multipleAssets: false })
        render(<AssetsTable />, { wrapper })

        const [loadTime] = await screen.findAllByText('2s')
        expect(loadTime).toBeInTheDocument()
      })

      it('renders size column', async () => {
        setup({ multipleAssets: false })
        render(<AssetsTable />, { wrapper })

        const [size] = await screen.findAllByText('66.67% (4kB)')
        expect(size).toBeInTheDocument()
      })

      it('renders change over time column', async () => {
        setup({ multipleAssets: false })
        render(<AssetsTable />, { wrapper })

        const [changeOverTime] = await screen.findAllByText('+5B 🔼')
        expect(changeOverTime).toBeInTheDocument()
      })

      describe('user is able to expand row', () => {
        it('displays modules table', async () => {
          const { user } = setup({ multipleAssets: false })
          render(<AssetsTable />, { wrapper })

          const expandButton = await screen.findByTestId('modules-expand')
          await user.click(expandButton)

          const modulesTable = await screen.findByText(
            'No modules found for this asset.'
          )
          expect(modulesTable).toBeInTheDocument()
        })
      })
    })

    describe('infinite scrolls', () => {
      it('fetches more assets when user scrolls to the bottom', async () => {
        setup({ multipleAssets: true })
        render(<AssetsTable />, { wrapper })

        const loading = await screen.findByText('Loading')
        mockIsIntersecting(loading, true)

        const asset2 = await screen.findByText('asset-2')
        expect(asset2).toBeInTheDocument()
      })
    })

    describe('sorting table', () => {
      describe('sorting on asset column', () => {
        it('sorts the table by asset', async () => {
          const { user, mockOrdering } = setup({ multipleAssets: false })
          render(<AssetsTable />, { wrapper })

          const assetColumn = await screen.findByText('Asset')
          await user.click(assetColumn)

          await waitFor(() => expect(mockOrdering).toHaveBeenCalledWith('NAME'))
        })
      })

      describe('sorting on type column', () => {
        it('sorts the table by type', async () => {
          const { user, mockOrdering } = setup({ multipleAssets: false })
          render(<AssetsTable />, { wrapper })

          const typeColumn = await screen.findByText('Type')
          await user.click(typeColumn)

          await waitFor(() => expect(mockOrdering).toHaveBeenCalledWith('TYPE'))
        })
      })

      describe('sorting on load time column', () => {
        it('sorts the table by size', async () => {
          const { user, mockOrdering } = setup({ multipleAssets: false })
          render(<AssetsTable />, { wrapper })

          const loadTimeColumn = await screen.findByText('Est. load time (3G)')
          await user.click(loadTimeColumn)

          await waitFor(() => expect(mockOrdering).toHaveBeenCalledWith('SIZE'))
        })
      })

      describe('sorting on size column', () => {
        it('sorts the table by size', async () => {
          const { user, mockOrdering } = setup({ multipleAssets: false })
          render(<AssetsTable />, { wrapper })

          const sizeColumn = await screen.findByText('Size')
          await user.click(sizeColumn)

          await waitFor(() => expect(mockOrdering).toHaveBeenCalledWith('SIZE'))
        })
      })

      describe('sorting once sets the order to ascending', () => {
        it('sorts the table by size', async () => {
          const { user, mockOrderingDirection } = setup({
            multipleAssets: false,
          })
          render(<AssetsTable />, { wrapper })

          const sizeColumn = await screen.findByText('Size')
          await user.click(sizeColumn)

          await waitFor(() =>
            expect(mockOrderingDirection).toHaveBeenCalledWith('ASC')
          )
        })
      })

      describe('sorting twice sets the order to descending', () => {
        it('sorts the table by size', async () => {
          const { user, mockOrderingDirection } = setup({
            multipleAssets: false,
          })
          render(<AssetsTable />, { wrapper })

          const sizeColumn = await screen.findByText('Size')
          await user.click(sizeColumn)
          await user.click(sizeColumn)

          await waitFor(() =>
            expect(mockOrderingDirection).toHaveBeenCalledWith('DESC')
          )
        })
      })
    })
  })
})

describe('ChangeOverTime', () => {
  it('renders the change change', () => {
    render(<ChangeOverTime change={5} hasMeasurements={true} />)

    const change = screen.getByText('+5B 🔼')
    expect(change).toBeInTheDocument()
  })

  it('renders the change change when it is negative', () => {
    render(<ChangeOverTime change={-5} hasMeasurements={true} />)

    const change = screen.getByText('-5B 🔽')
    expect(change).toBeInTheDocument()
  })

  it('renders the change change when it is zero', () => {
    render(<ChangeOverTime change={0} hasMeasurements={true} />)

    const change = screen.getByText('-')
    expect(change).toBeInTheDocument()
  })

  it('renders the change change when it is null', () => {
    render(<ChangeOverTime change={null} hasMeasurements={true} />)

    const change = screen.getByText('-')
    expect(change).toBeInTheDocument()
  })

  describe('hasMeasurements is false', () => {
    it('renders nothing', () => {
      const { container } = render(
        <ChangeOverTime change={null} hasMeasurements={false} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })
})
