import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { AssetsTable, ChangeOverTime } from './AssetsTable'

jest.mock('./EmptyTable', () => () => <div>EmptyTable</div>)

interface Asset {
  name: string
  extension: string
  bundleData: {
    loadTime: {
      threeG: number
      highSpeed: number
    }
    size: {
      uncompress: number
      gzip: number
    }
  }
  measurements: {
    change: {
      size: {
        uncompress: number
      }
    }
    measurements: Array<{
      timestamp: string
      avg: number | null
    }>
  } | null
}

const mockAssets = (multipleAssets = true) => {
  const assets: Array<Asset> = [
    {
      name: 'asset-1',
      extension: 'js',
      bundleData: {
        loadTime: {
          threeG: 2000,
          highSpeed: 2000,
        },
        size: {
          uncompress: 4000,
          gzip: 400,
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
          { timestamp: '2022-10-11T11:59:59', avg: null },
        ],
      },
    },
  ]

  const asset2 = {
    name: 'asset-2',
    extension: 'js',
    bundleData: {
      loadTime: {
        threeG: 2000,
        highSpeed: 2000,
      },
      size: {
        uncompress: 2000,
        gzip: 200,
      },
    },
    measurements: {
      change: {
        size: {
          uncompress: -5,
        },
      },
      measurements: [
        { timestamp: '2022-10-10T11:59:59', avg: 6 },
        { timestamp: '2022-10-11T11:59:59', avg: null },
      ],
    },
  }

  const asset3 = {
    name: 'asset-3',
    extension: 'js',
    bundleData: {
      loadTime: {
        threeG: 2000,
        highSpeed: 2000,
      },
      size: {
        uncompress: 2000,
        gzip: 200,
      },
    },
    measurements: null,
  }

  if (multipleAssets) {
    assets.push(asset2)
    assets.push(asset3)
  }

  return {
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
                    uncompress: 6000,
                  },
                },
                assets,
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
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            bundle: {
              bundleData: {
                size: {
                  uncompress: 12,
                },
              },
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
              bundleData: {
                size: {
                  uncompress: 12,
                },
              },
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
      testAnalyticsEnabled: true,
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
  multipleAssets?: boolean
}

describe('AssetsTable', () => {
  function setup({
    isEmptyBundles = false,
    isMissingHeadReport = false,
    multipleAssets = true,
  }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('BundleAssets', (req, res, ctx) => {
        if (isEmptyBundles) {
          return res(ctx.status(200), ctx.data(mockEmptyAssets))
        } else if (isMissingHeadReport) {
          return res(ctx.status(200), ctx.data(mockMissingHeadReport))
        }

        return res(ctx.status(200), ctx.data(mockAssets(multipleAssets)))
      }),
      graphql.query('BundleAssetModules', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockBundleAssetModules))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
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

      it('renders load time column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const loadTime = await screen.findByText('Estimated load time (3G)')
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

      it('renders load time column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const [loadTime] = await screen.findAllByText('2s')
        expect(loadTime).toBeInTheDocument()
      })

      it('renders size column', async () => {
        setup({})
        render(<AssetsTable />, { wrapper })

        const [size] = await screen.findAllByText('66.67% (4kB)')
        expect(size).toBeInTheDocument()
      })

      it('renders change over time column', async () => {
        setup({})
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

    describe('sorting table', () => {
      describe('sorting on size column', () => {
        it('sorts the table by size', async () => {
          const { user } = setup({})
          render(<AssetsTable />, { wrapper })

          const sizeColumn = await screen.findByText('Size')
          await user.click(sizeColumn)

          const [asset] = await screen.findAllByText('asset-1')
          expect(asset).toBeInTheDocument()
        })
      })

      describe('sorting on change over time column', () => {
        it('sorts the table by change value', async () => {
          const { user } = setup({})
          render(<AssetsTable />, { wrapper })

          const changeColumn = await screen.findByText('Change over time')
          await user.click(changeColumn)
          await user.click(changeColumn)

          const [asset] = await screen.findAllByText('asset-1')
          expect(asset).toBeInTheDocument()
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
