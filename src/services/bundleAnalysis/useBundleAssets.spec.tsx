import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBundleAssets } from './useBundleAssets'

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

const mockBranchBundles = {
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
              assets: [
                {
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
                    measurements: [
                      { timestamp: '2022-10-10T11:59:59', avg: 6 },
                    ],
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

describe('useBundleAssets', () => {
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
      graphql.query('BundleAssets', (req, res, ctx) => {
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

        return res(ctx.status(200), ctx.data(mockBranchBundles))
      }),
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockRepoOverview))
      })
    )

    return { passedBranch, madeRequest }
  }

  describe('passing branch name', () => {
    it('uses the branch name passed in', async () => {
      const { passedBranch } = setup({})
      renderHook(
        () =>
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'cool-branch',
            bundle: 'test-bundle',
          }),
        { wrapper }
      )

      await waitFor(() => expect(passedBranch).toHaveBeenCalled())
      await waitFor(() =>
        expect(passedBranch).toHaveBeenCalledWith('cool-branch')
      )
    })
  })

  describe('no branch name passed', () => {
    it('uses the default branch', async () => {
      const { passedBranch } = setup({})
      renderHook(
        () =>
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            bundle: 'test-bundle',
          }),
        { wrapper }
      )

      await waitFor(() => expect(passedBranch).toHaveBeenCalled())
      await waitFor(() => expect(passedBranch).toHaveBeenCalledWith('main'))
    })
  })

  describe('returns repository typename of repository', () => {
    describe('there is valid data', () => {
      it('returns the list of assets', async () => {
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
          { wrapper }
        )

        const expectedResponse = {
          bundleUncompressSize: 12,
          assets: [
            {
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
            },
          ],
        }

        await waitFor(() =>
          expect(result.current.data).toStrictEqual(expectedResponse)
        )
      })
    })

    describe('there is a missing head report', () => {
      it('returns an empty list', async () => {
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
          { wrapper }
        )

        const expectedResponse = {
          bundleUncompressSize: null,
          assets: [],
        }

        await waitFor(() =>
          expect(result.current.data).toStrictEqual(expectedResponse)
        )
      })
    })
  })

  describe('there is invalid data', () => {
    it('returns a null value', async () => {
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
        { wrapper }
      )

      const expectedResponse = {
        assets: [],
        bundleUncompressSize: null,
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResponse)
      )
    })
  })

  describe('returns NotFoundError __typename', () => {
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
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
          }),
        { wrapper }
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

  describe('returns OwnerNotActivatedError __typename', () => {
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
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
          }),
        { wrapper }
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

  describe('unsuccessful parse of zod schema', () => {
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
          useBundleAssets({
            provider: 'gh',
            owner: 'codecov',
            repo: 'codecov',
            branch: 'main',
            bundle: 'test-bundle',
          }),
        { wrapper }
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

  describe('passing enabled to opts object', () => {
    describe('enabled is true', () => {
      describe('branch is not passed', () => {
        it('runs the query', async () => {
          const { madeRequest } = setup({})
          renderHook(
            () =>
              useBundleAssets({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                bundle: 'test-bundle',
                opts: {
                  enabled: true,
                },
              }),
            { wrapper }
          )

          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() => expect(madeRequest).toHaveBeenCalled())
        })
      })

      describe('branch is passed', () => {
        it('runs the query', async () => {
          const { madeRequest } = setup({})
          renderHook(
            () =>
              useBundleAssets({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                branch: 'cool-branch',
                bundle: 'test-bundle',
                opts: {
                  enabled: true,
                },
              }),
            { wrapper }
          )

          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() => expect(madeRequest).toHaveBeenCalled())
        })
      })
    })

    describe('enabled is false', () => {
      describe('branch is not passed', () => {
        it('does not run the query', async () => {
          const { madeRequest } = setup({})
          renderHook(
            () =>
              useBundleAssets({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                bundle: 'test-bundle',
                opts: {
                  enabled: false,
                },
              }),
            { wrapper }
          )

          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() => expect(madeRequest).not.toHaveBeenCalled())
        })
      })

      describe('branch is passed', () => {
        it('does not run the query', async () => {
          const { madeRequest } = setup({})
          renderHook(
            () =>
              useBundleAssets({
                provider: 'gh',
                owner: 'codecov',
                repo: 'codecov',
                branch: 'cool-branch',
                bundle: 'test-bundle',
                opts: {
                  enabled: false,
                },
              }),
            { wrapper }
          )

          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() => expect(madeRequest).not.toHaveBeenCalled())
        })
      })
    })
  })
})
