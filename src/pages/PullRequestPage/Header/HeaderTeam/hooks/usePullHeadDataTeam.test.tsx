import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { usePullHeadDataTeam } from './usePullHeadDataTeam'

const mockPullData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 1,
        title: 'Cool Pull Request',
        state: 'OPEN',
        author: {
          username: 'cool-user',
        },
        head: {
          branchName: 'cool-branch',
          ciPassed: true,
        },
        updatestamp: '',
        compareWithBase: {
          __typename: 'Comparison',
          patchTotals: {
            percentCovered: 35.45,
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

describe('usePullHeadDataTeam', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('PullHeadDataTeam', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwner })
        } else {
          return HttpResponse.json({ data: mockPullData })
        }
      })
    )
  }

  describe('calling hook', () => {
    describe('returns Repository __typename', () => {
      describe('there is data', () => {
        it('returns the correct data', async () => {
          setup({})
          const { result } = renderHook(
            () =>
              usePullHeadDataTeam({
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
              pull: {
                pullId: 1,
                title: 'Cool Pull Request',
                state: 'OPEN',
                author: {
                  username: 'cool-user',
                },
                head: {
                  branchName: 'cool-branch',
                  ciPassed: true,
                },
                updatestamp: '',
                compareWithBase: {
                  __typename: 'Comparison',
                  patchTotals: {
                    percentCovered: 35.45,
                  },
                },
              },
            })
          )
        })
      })

      describe('there is a null owner', () => {
        it('returns null data', async () => {
          setup({ isNullOwner: true })
          const { result } = renderHook(
            () =>
              usePullHeadDataTeam({
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
            usePullHeadDataTeam({
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
            usePullHeadDataTeam({
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
            usePullHeadDataTeam({
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
  })
})
