import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import ModulesTable from './ModulesTable'

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
                modules: [
                  {
                    name: 'module1',
                    extension: 'js',
                    bundleData: {
                      loadTime: {
                        threeG: 100,
                        highSpeed: 200,
                      },
                      size: {
                        gzip: 50,
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
      suspense: true,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={['/gh/codecov/test-repo/bundles/test-branch/test-bundle']}
    >
      <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
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
  noAssets?: boolean
}

describe('ModulesTable', () => {
  function setup({ noAssets = false }: SetupArgs) {
    server.use(
      graphql.query('BundleAssetModules', (req, res, ctx) => {
        if (noAssets) {
          return res(ctx.status(200), ctx.data(mockMissingHeadReport))
        }

        return res(ctx.status(200), ctx.data(mockBundleAssetModules))
      })
    )
  }

  describe('there is no modules found', () => {
    it('renders error message', async () => {
      setup({ noAssets: true })
      render(<ModulesTable asset="file.js" />, { wrapper })

      const errorMessage = await screen.findByText(
        'No modules found for this asset.'
      )
      expect(errorMessage).toBeInTheDocument()
    })
  })

  describe('there are modules found', () => {
    it('renders the module name', async () => {
      setup({})
      render(<ModulesTable asset="file.js" />, { wrapper })

      const name = await screen.findByText('module1')
      expect(name).toBeInTheDocument()
    })

    it('renders the module type', async () => {
      setup({})
      render(<ModulesTable asset="file.js" />, { wrapper })

      const type = await screen.findByText('js')
      expect(type).toBeInTheDocument()
    })

    it('renders the module size', async () => {
      setup({})
      render(<ModulesTable asset="file.js" />, { wrapper })

      const size = await screen.findByText('100B')
      expect(size).toBeInTheDocument()
    })

    it('renders the module load time', async () => {
      setup({})
      render(<ModulesTable asset="file.js" />, { wrapper })

      const loadTime = await screen.findByText('100ms')
      expect(loadTime).toBeInTheDocument()
    })
  })
})
