import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePagedBundleAssets } from './usePagedBundleAssets'

const node1 = {
  name: 'asset-1',
  extension: 'js',
  bundleData: {
    loadTime: {
      threeG: 1,
      highSpeed: 2,
    },
    size: {
      uncompress: 3,
      gzip: 4,
    },
  },
  measurements: {
    change: {
      size: {
        uncompress: 5,
      },
    },
    measurements: [{ timestamp: '2022-10-10T11:59:59', avg: 6 }],
  },
}

const node2 = {
  name: 'asset-2',
  extension: 'js',
  bundleData: {
    loadTime: {
      threeG: 1,
      highSpeed: 2,
    },
    size: {
      uncompress: 3,
      gzip: 4,
    },
  },
  measurements: {
    change: {
      size: {
        uncompress: 5,
      },
    },
    measurements: [{ timestamp: '2022-10-10T11:59:59', avg: 6 }],
  },
}

const node3 = {
  name: 'asset-3',
  extension: 'js',
  bundleData: {
    loadTime: {
      threeG: 1,
      highSpeed: 2,
    },
    size: {
      uncompress: 3,
      gzip: 4,
    },
  },
  measurements: {
    change: {
      size: {
        uncompress: 5,
      },
    },
    measurements: [{ timestamp: '2022-10-10T11:59:59', avg: 6 }],
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

const mockUnsuccessfulParseError = {}

const mockNullOwner = { owner: null }

const mockRepoNotFound = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'Repository not found',
    },
  },
}

const mockOwnerNotActivated = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'Owner not activated',
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
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  jest.resetAllMocks()
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
  missingHeadReport?: boolean
}

describe('usePagedBundleAssets', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    missingHeadReport = false,
  }: SetupArgs) {
    const passedBranch = jest.fn()
    const madeRequest = jest.fn()

    server.use(
      graphql.query('PagedBundleAssets', (req, res, ctx) => {
        madeRequest()
        if (req.variables?.branch) {
          passedBranch(req.variables?.branch)
        }

        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockRepoNotFound))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivated))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else if (missingHeadReport) {
          return res(ctx.status(200), ctx.data(mockMissingHeadReport))
        }

        return res(
          ctx.status(200),
          ctx.data({
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
                          edges: req.variables.assetsAfter
                            ? [{ node: node3 }]
                            : [{ node: node1 }, { node: node2 }],
                          pageInfo: {
                            hasNextPage: req.variables.assetsAfter
                              ? false
                              : true,
                            endCursor: req.variables.assetsAfter
                              ? 'aa'
                              : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        )
      })
    )

    return { passedBranch, madeRequest }
  }

  describe('when __typename is Repository', () => {
    it('returns expected asset nodes', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          usePagedBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            ordering: 'NAME',
            orderingDirection: 'ASC',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => {
        expect(result.current.data?.assets).toEqual([node1, node2])
      })
    })

    describe('calling next page', () => {
      it('adds in the next page of assets', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            usePagedBundleAssets({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
              ordering: 'NAME',
              orderingDirection: 'ASC',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => {
          expect(result.current.data).toEqual({
            assets: [node1, node2],
            bundleData: { size: { uncompress: 12 } },
          })
        })

        result.current.fetchNextPage()

        await waitFor(() => result.current.isFetching)
        await waitFor(() => !result.current.isFetching)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            assets: [node1, node2, node3],
            bundleData: { size: { uncompress: 12 } },
          })
        )
      })
    })

    describe('there is a missing head report', () => {
      it('returns an empty array', async () => {
        setup({ missingHeadReport: true })
        const { result } = renderHook(
          () =>
            usePagedBundleAssets({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
              ordering: 'NAME',
              orderingDirection: 'ASC',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(result.current.isLoading).toBeTruthy())
        await waitFor(() => expect(result.current.isLoading).toBeFalsy())

        await waitFor(() => {
          expect(result.current.data).toEqual({ assets: [], bundleData: null })
        })
      })
    })
  })

  describe('owner is null', () => {
    it('returns an empty array', async () => {
      setup({ isNullOwner: true })
      const { result } = renderHook(
        () =>
          usePagedBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            ordering: 'NAME',
            orderingDirection: 'ASC',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isLoading).toBeTruthy())
      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      await waitFor(() => {
        expect(result.current.data).toEqual({ assets: [], bundleData: null })
      })
    })
  })

  describe('when __typename is NotFoundError', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          usePagedBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            ordering: 'NAME',
            orderingDirection: 'ASC',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })

  describe('when __typename is OwnerNotActivatedError', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          usePagedBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            ordering: 'NAME',
            orderingDirection: 'ASC',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
          })
        )
      )
    })
  })

  describe('unsuccessful parse error', () => {
    let oldConsoleError = console.error

    beforeEach(() => {
      console.error = () => null
    })

    afterEach(() => {
      console.error = oldConsoleError
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          usePagedBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
            ordering: 'NAME',
            orderingDirection: 'ASC',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })
})
