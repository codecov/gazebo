import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { CommitPageDataQueryOpts } from './CommitPageDataQueryOpts'

const mockCommitData = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      private: false,
      bundleAnalysisEnabled: true,
      coverageEnabled: true,
      commit: {
        commitid: 'id-1',
        compareWithParent: {
          __typename: 'Comparison',
        },
        bundleAnalysis: {
          bundleAnalysisReport: {
            __typename: 'BundleAnalysisReport',
            isCached: false,
          },
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
          },
        },
      },
    },
  },
}

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: false,
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: false,
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

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
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
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('CommitPageData', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CommitPageData', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockCommitData })
        }
      })
    )
  }

  describe('when executed', () => {
    describe('returns Repository __typename', () => {
      describe('there is data', () => {
        it('fetches the correct data', async () => {
          setup({})

          const { result } = renderHook(
            () =>
              useQueryV5(
                CommitPageDataQueryOpts({
                  provider: 'gh',
                  owner: 'codecov',
                  repo: 'cool-repo',
                  commitId: 'id-1',
                })
              ),
            { wrapper }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          const expectedResult = {
            isCurrentUserPartOfOrg: true,
            private: false,
            bundleAnalysisEnabled: true,
            coverageEnabled: true,
            commit: {
              commitid: 'id-1',
              compareWithParent: {
                __typename: 'Comparison',
              },
              bundleAnalysis: {
                bundleAnalysisReport: {
                  __typename: 'BundleAnalysisReport',
                  isCached: false,
                },
                bundleAnalysisCompareWithParent: {
                  __typename: 'BundleAnalysisComparison',
                },
              },
            },
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedResult)
          )
        })
      })
      describe('there is a null owner', () => {
        it('returns null value', async () => {
          setup({ isNullOwner: true })

          const { result } = renderHook(
            () =>
              useQueryV5(
                CommitPageDataQueryOpts({
                  provider: 'gh',
                  owner: 'codecov',
                  repo: 'cool-repo',
                  commitId: 'id-1',
                })
              ),
            { wrapper }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          const expectedResult = {
            isCurrentUserPartOfOrg: null,
            private: null,
            bundleAnalysisEnabled: null,
            coverageEnabled: null,
            commit: null,
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedResult)
          )
        })
      })
    })

    describe('returns NotFoundError __typename', () => {
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws an error', async () => {
        setup({ isNotFoundError: true })

        const { result } = renderHook(
          () =>
            useQueryV5(
              CommitPageDataQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                commitId: 'id-1',
              })
            ),
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
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws an error', async () => {
        setup({ isOwnerNotActivatedError: true })

        const { result } = renderHook(
          () =>
            useQueryV5(
              CommitPageDataQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                commitId: 'id-1',
              })
            ),
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
      const oldConsoleError = console.error

      beforeEach(() => {
        console.error = () => null
      })

      afterEach(() => {
        console.error = oldConsoleError
      })

      it('throws an error', async () => {
        setup({ isUnsuccessfulParseError: true })

        const { result } = renderHook(
          () =>
            useQueryV5(
              CommitPageDataQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                commitId: 'id-1',
              })
            ),
          { wrapper }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'CommitPageDataQueryOpts - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })
})
