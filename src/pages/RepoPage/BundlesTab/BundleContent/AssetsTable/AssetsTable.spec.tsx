import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import AssetsTable from './AssetsTable'

jest.mock('./EmptyTable', () => () => <div>EmptyTable</div>)

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

const mockBundleAssetModules = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundle: {
              asset: {
                modules: [],
              },
            },
          },
        },
      },
    },
  },
}

const mockEmptyAssets = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundle: {
              assets: [],
            },
          },
        },
      },
    },
  },
}

const mockMissingHeadReport = {
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
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={['/gh/codecov/test-repo/bundles/test-branch/test-bundle']}
    >
      <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
        {children}
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
  isEmptyBundles?: boolean
  isMissingHeadReport?: boolean
}

describe('AssetsTable', () => {
  function setup({
    isEmptyBundles = false,
    isMissingHeadReport = false,
  }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('BundleAssets', (req, res, ctx) => {
        if (isEmptyBundles) {
          return res(ctx.status(200), ctx.data(mockEmptyAssets))
        } else if (isMissingHeadReport) {
          return res(ctx.status(200), ctx.data(mockMissingHeadReport))
        }

        return res(ctx.status(200), ctx.data(mockAssets))
      }),
      graphql.query('BundleAssetModules', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBundleAssetModules))
      })
    )

    return { user }
  }

  describe('there is no data', () => {
    it('renders the empty table', async () => {
      setup({ isEmptyBundles: true })
      render(<AssetsTable />, { wrapper })

      const table = await screen.findByText('EmptyTable')
      expect(table).toBeInTheDocument()
    })
  })

  describe('there are no assets', () => {
    it('renders the empty table', async () => {
      setup({ isMissingHeadReport: true })
      render(<AssetsTable />, { wrapper })

      const table = await screen.findByText('EmptyTable')
      expect(table).toBeInTheDocument()
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

      it('renders type column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const type = await screen.findByText('Type')
        expect(type).toBeInTheDocument()
      })

      it('renders size column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const size = await screen.findByText('Size')
        expect(size).toBeInTheDocument()
      })

      it('renders load time column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const loadTime = await screen.findByText('Estimated load time (3G)')
        expect(loadTime).toBeInTheDocument()
      })
    })

    describe('renders table rows', () => {
      it('renders asset column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const asset = await screen.findByText('asset-1')
        expect(asset).toBeInTheDocument()
      })

      it('renders type column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const [type] = await screen.findAllByText('js')
        expect(type).toBeInTheDocument()
      })

      it('renders size column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const [size] = await screen.findAllByText('3kB')
        expect(size).toBeInTheDocument()
      })

      it('renders load time column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const [loadTime] = await screen.findAllByText('2s')
        expect(loadTime).toBeInTheDocument()
      })

      describe('user is able to expand row', () => {
        it('displays modules table', async () => {
          const { user } = setup({})
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
  })
})
