import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { usePullPageData } from './usePullPageData'

const mockPullData = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      pull: {
        pullId: 1,
        commits: {
          totalCount: 11,
        },
        head: {
          commitid: '123',
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
            },
          },
        },
        compareWithBase: {
          __typename: 'Comparison',
          impactedFilesCount: 4,
          indirectChangedFilesCount: 0,
          flagComparisonsCount: 1,
          componentComparisonsCount: 6,
          directChangedFilesCount: 0,
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
        },
      },
    },
  },
}

const mockPullDataTeam = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      pull: {
        pullId: 1,
        commits: {
          totalCount: 11,
        },
        head: {
          commitid: '123',
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
            },
          },
        },
        compareWithBase: {
          __typename: 'Comparison',
          impactedFilesCount: 4,
          directChangedFilesCount: 0,
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
        },
      },
    },
  },
}

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    repository: {
      __typename: 'OwnerNotActivatedError',
      message: 'owner not activated',
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('usePullPageData', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('PullPageData', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return info.variables.isTeamPlan
            ? HttpResponse.json({ data: mockPullDataTeam })
            : HttpResponse.json({ data: mockPullData })
        }
      })
    )
  }

  describe('calling hook', () => {
    describe('repository __typename of Repository', () => {
      describe('there is data', () => {
        it('returns the correct data', async () => {
          setup({})

          const { result } = renderHook(
            () =>
              usePullPageData({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                pullId: '1',
              }),
            {
              wrapper,
            }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              coverageEnabled: true,
              bundleAnalysisEnabled: true,
              pull: {
                pullId: 1,
                commits: {
                  totalCount: 11,
                },
                head: {
                  commitid: '123',
                  bundleAnalysis: {
                    bundleAnalysisReport: {
                      __typename: 'BundleAnalysisReport',
                    },
                  },
                },
                compareWithBase: {
                  __typename: 'Comparison',
                  impactedFilesCount: 4,
                  indirectChangedFilesCount: 0,
                  flagComparisonsCount: 1,
                  componentComparisonsCount: 6,
                  directChangedFilesCount: 0,
                },
                bundleAnalysisCompareWithBase: {
                  __typename: 'BundleAnalysisComparison',
                },
              },
            })
          )
        })
      })

      describe('there is no data', () => {
        it('returns the correct data', async () => {
          setup({ isNullOwner: true })

          const { result } = renderHook(
            () =>
              usePullPageData({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                pullId: '1',
              }),
            {
              wrapper,
            }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() =>
            expect(result.current.data).toStrictEqual({
              coverageEnabled: null,
              bundleAnalysisEnabled: null,
              pull: null,
            })
          )
        })
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
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
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
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
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
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
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

    describe('user on team plan', () => {
      it('returns the correct subset of data', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            usePullPageData({
              provider: 'gh',
              owner: 'codecov',
              repo: 'cool-repo',
              pullId: '1',
              isTeamPlan: true,
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            coverageEnabled: true,
            bundleAnalysisEnabled: true,
            pull: {
              pullId: 1,
              commits: {
                totalCount: 11,
              },
              head: {
                commitid: '123',
                bundleAnalysis: {
                  bundleAnalysisReport: {
                    __typename: 'BundleAnalysisReport',
                  },
                },
              },
              compareWithBase: {
                __typename: 'Comparison',
                impactedFilesCount: 4,
                directChangedFilesCount: 0,
              },
              bundleAnalysisCompareWithBase: {
                __typename: 'BundleAnalysisComparison',
              },
            },
          })
        )
      })
    })
  })
})
