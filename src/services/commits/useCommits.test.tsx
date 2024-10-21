import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useCommits } from './useCommits'

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

const server = setupServer()

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

const node1 = {
  ciPassed: true,
  message: 'commit message',
  commitid: '1',
  createdAt: '2023',
  author: {
    username: 'codecov-user',
    avatarUrl: 'http://127.0.0.1/avatar-url',
  },
  bundleStatus: 'PENDING',
  coverageStatus: 'PENDING',
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 100,
    },
  },
  bundleAnalysis: {
    bundleAnalysisCompareWithParent: {
      __typename: 'MissingHeadReport',
      message: 'Missing head report',
    },
  },
}

const node2 = {
  ciPassed: true,
  message: 'commit message',
  commitid: '2',
  createdAt: '2023',
  author: {
    username: 'codecov-user',
    avatarUrl: 'http://127.0.0.1/avatar-url',
  },
  bundleStatus: 'PENDING',
  coverageStatus: 'PENDING',
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 100,
    },
  },
  bundleAnalysis: {
    bundleAnalysisCompareWithParent: {
      __typename: 'MissingHeadReport',
      message: 'Missing head report',
    },
  },
}

const node3 = {
  ciPassed: true,
  message: 'commit message',
  commitid: '3',
  createdAt: '2023',
  author: {
    username: 'codecov-user',
    avatarUrl: 'http://127.0.0.1/avatar-url',
  },
  bundleStatus: 'PENDING',
  coverageStatus: 'PENDING',
  compareWithParent: {
    __typename: 'Comparison',
    patchTotals: {
      percentCovered: 100,
    },
  },
  bundleAnalysis: {
    bundleAnalysisCompareWithParent: {
      __typename: 'MissingHeadReport',
      message: 'Missing head report',
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

const mockNullOwnerData = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('GetCommits', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetCommits', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwnerData })
        }

        const dataReturned = {
          owner: {
            repository: {
              __typename: 'Repository',
              commits: {
                edges: info.variables.after
                  ? [
                      {
                        node: node3,
                      },
                    ]
                  : [
                      {
                        node: node1,
                      },
                      {
                        node: node2,
                      },
                    ],
                pageInfo: {
                  hasNextPage: info.variables.after ? false : true,
                  endCursor: info.variables.after
                    ? 'aa'
                    : 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                },
              },
            },
          },
        }

        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when __typename is Repository', () => {
    describe('when valid data is returned', () => {
      describe('when data is loaded', () => {
        it('returns the data', async () => {
          setup({})

          const { result } = renderHook(
            () => useCommits({ provider, owner, repo }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toEqual({
              pageParams: [undefined],
              pages: [
                {
                  commits: [node1, node2],
                  commitsCount: null,
                  pageInfo: {
                    endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                    hasNextPage: true,
                  },
                },
              ],
            })
          )
        })
      })

      describe('when calling next page', () => {
        it('returns prev and next page commits of the user', async () => {
          setup({})

          const { result } = renderHook(
            () => useCommits({ provider, owner, repo }),
            { wrapper }
          )

          await waitFor(() => expect(result.current.isSuccess).toBe(true))

          result.current.fetchNextPage()

          await waitFor(() => result.current.isFetching)
          await waitFor(() => !result.current.isFetching)

          await waitFor(() =>
            expect(result.current.data).toEqual({
              pageParams: [
                undefined,
                'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
              ],
              pages: [
                {
                  commits: [node1, node2],
                  commitsCount: null,
                  pageInfo: {
                    endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
                    hasNextPage: true,
                  },
                },
                {
                  commits: [node3],
                  commitsCount: null,
                  pageInfo: {
                    endCursor: 'aa',
                    hasNextPage: false,
                  },
                },
              ],
            })
          )
        })
      })
    })

    describe('when null owner is returned', () => {
      it('returns an empty list', async () => {
        setup({ isNullOwner: true })

        const { result } = renderHook(
          () => useCommits({ provider, owner, repo }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            pageParams: [undefined],
            pages: [
              {
                commits: [],
                commitsCount: null,
                pageInfo: null,
              },
            ],
          })
        )
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
        () => useCommits({ provider, owner, repo }),
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
        () => useCommits({ provider, owner, repo }),
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
        () => useCommits({ provider, owner, repo }),
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
})
