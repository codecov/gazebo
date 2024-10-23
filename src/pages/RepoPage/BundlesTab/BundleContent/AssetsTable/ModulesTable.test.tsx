import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
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
          bundleAnalysis: {
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
  },
}

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

const server = setupServer()
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <MemoryRouter
      initialEntries={['/gh/codecov/test-repo/bundles/test-branch/test-bundle']}
    >
      <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
        <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
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
      graphql.query('BundleAssetModules', (info) => {
        if (noAssets) {
          return HttpResponse.json({ data: mockMissingHeadReport })
        }

        return HttpResponse.json({ data: mockBundleAssetModules })
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

      const [name] = await screen.findAllByText('module1')
      expect(name).toBeInTheDocument()
    })

    it('renders the module type', async () => {
      setup({})
      render(<ModulesTable asset="file.js" />, { wrapper })

      const [type] = await screen.findAllByText('js')
      expect(type).toBeInTheDocument()
    })

    it('renders the module size', async () => {
      setup({})
      render(<ModulesTable asset="file.js" />, { wrapper })

      const [size] = await screen.findAllByText('100B')
      expect(size).toBeInTheDocument()
    })

    it('renders the module load time', async () => {
      setup({})
      render(<ModulesTable asset="file.js" />, { wrapper })

      const [loadTime] = await screen.findAllByText('100ms')
      expect(loadTime).toBeInTheDocument()
    })
  })
})
