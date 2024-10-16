import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { useBundleAssets } from './useBundleAssets'

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
  vi.clearAllMocks()
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

describe('useBundleAssets', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    missingHeadReport = false,
  }: SetupArgs) {
    const passedBranch = vi.fn()
    const madeRequest = vi.fn()

    server.use(
      graphql.query('BundleAssets', (info) => {
        madeRequest()
        if (info.variables?.branch) {
          passedBranch(info.variables?.branch)
        }

        if (isNotFoundError) {
          return HttpResponse.json({ data: mockRepoNotFound })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivated })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else if (missingHeadReport) {
          return HttpResponse.json({ data: mockMissingHeadReport })
        }

        return HttpResponse.json({
          data: {
            owner: {
              repository: {
                __typename: 'Repository',
                branch: {
                  head: {
                    bundleAnalysis: {
                      bundleAnalysisReport: {
                        __typename: 'BundleAnalysisReport',
                        bundle: {
                          bundleData: {
                            size: {
                              uncompress: 12,
                            },
                          },
                          assetsPaginated: {
                            edges: info.variables.assetsAfter
                              ? [{ node: node3 }]
                              : [{ node: node1 }, { node: node2 }],
                            pageInfo: {
                              hasNextPage: info.variables.assetsAfter
                                ? false
                                : true,
                              endCursor: info.variables.assetsAfter
                                ? 'cursor-1'
                                : 'cursor-2',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })
      })
    )

    return { passedBranch, madeRequest }
  }

  describe('when __typename is Repository', () => {
    it('returns expected asset nodes', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => {
        expect(result.current.data).toEqual({
          pageParams: [undefined],
          pages: [
            {
              assets: [node1, node2],
              bundleData: { size: { uncompress: 12 } },
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-2',
              },
            },
          ],
        })
      })
    })

    describe('calling next page', () => {
      it('adds in the next page of assets', async () => {
        setup({})
        const { result } = renderHook(
          () =>
            useBundleAssets({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => {
          expect(result.current.data).toEqual({
            pageParams: [undefined],
            pages: [
              {
                assets: [node1, node2],
                bundleData: { size: { uncompress: 12 } },
                pageInfo: {
                  hasNextPage: true,
                  endCursor: 'cursor-2',
                },
              },
            ],
          })
        })

        result.current.fetchNextPage()

        await waitFor(() => result.current.isFetching)
        await waitFor(() => !result.current.isFetching)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            pageParams: [undefined, 'cursor-2'],
            pages: [
              {
                assets: [node1, node2],
                bundleData: { size: { uncompress: 12 } },
                pageInfo: {
                  endCursor: 'cursor-2',
                  hasNextPage: true,
                },
              },
              {
                assets: [node3],
                bundleData: { size: { uncompress: 12 } },
                pageInfo: {
                  endCursor: 'cursor-1',
                  hasNextPage: false,
                },
              },
            ],
          })
        )
      })
    })

    describe('there is a missing head report', () => {
      it('returns an empty array', async () => {
        setup({ missingHeadReport: true })
        const { result } = renderHook(
          () =>
            useBundleAssets({
              provider: 'gh',
              owner: 'codecov',
              repo: 'codecov',
              branch: 'main',
              bundle: 'test-bundle',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(result.current.isLoading).toBeTruthy())
        await waitFor(() => expect(result.current.isLoading).toBeFalsy())

        await waitFor(() => {
          expect(result.current.data).toEqual({
            pageParams: [undefined],
            pages: [
              {
                assets: [],
                bundleData: null,
                pageInfo: null,
              },
            ],
          })
        })
      })
    })
  })

  describe('owner is null', () => {
    it('returns an empty array', async () => {
      setup({ isNullOwner: true })
      const { result } = renderHook(
        () =>
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => expect(result.current.isLoading).toBeTruthy())
      await waitFor(() => expect(result.current.isLoading).toBeFalsy())

      await waitFor(() => {
        expect(result.current.data).toEqual({
          pageParams: [undefined],
          pages: [{ assets: [], bundleData: null, pageInfo: null }],
        })
      })
    })
  })

  describe('when __typename is NotFoundError', () => {
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
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
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
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
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
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
