import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'

import { useCommitHeaderDataTeam } from './useCommitHeaderDataTeam'

const mockRepository = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        author: {
          username: 'cool-user',
        },
        branchName: 'cool-branch',
        ciPassed: true,
        commitid: 'id-1',
        createdAt: '2022-01-01T12:59:59',
        message: 'cool commit message',
        pullId: 1234,
        compareWithParent: {
          __typename: 'Comparison',
          patchTotals: {
            percentCovered: 100,
          },
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
  defaultOptions: { queries: { retry: false, useErrorBoundary: false } },
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

describe('useCommitHeaderDataTeam', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('CommitPageHeaderDataTeam', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockRepository })
        }
      })
    )
  }

  describe('fetching data', () => {
    describe('returns Repository __typename', () => {
      describe('there is data', () => {
        it('sets the correct data', async () => {
          setup({})

          const { result } = renderHook(
            () =>
              useCommitHeaderDataTeam({
                provider: 'gh',
                owner: 'codecov',
                repo: 'test-repo',
                commitId: 'id-1',
              }),
            { wrapper }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          const expectedResult = {
            commit: {
              author: {
                username: 'cool-user',
              },
              branchName: 'cool-branch',
              ciPassed: true,
              commitid: 'id-1',
              createdAt: '2022-01-01T12:59:59',
              message: 'cool commit message',
              pullId: 1234,
              compareWithParent: {
                __typename: 'Comparison',
                patchTotals: {
                  percentCovered: 100,
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
        it('sets the correct data', async () => {
          setup({ isNullOwner: true })

          const { result } = renderHook(
            () =>
              useCommitHeaderDataTeam({
                provider: 'gh',
                owner: 'codecov',
                repo: 'test-repo',
                commitId: 'id-1',
              }),
            { wrapper }
          )

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          const expectedResult = {
            commit: null,
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedResult)
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

      it('throws an error', async () => {
        setup({ isNotFoundError: true })

        const { result } = renderHook(
          () =>
            useCommitHeaderDataTeam({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
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

      it('throws an error', async () => {
        setup({ isOwnerNotActivatedError: true })

        const { result } = renderHook(
          () =>
            useCommitHeaderDataTeam({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
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

      it('throws an error', async () => {
        setup({ isUnsuccessfulParseError: true })

        const { result } = renderHook(
          () =>
            useCommitHeaderDataTeam({
              provider: 'gh',
              owner: 'codecov',
              repo: 'test-repo',
              commitId: 'id-1',
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
  })
})
