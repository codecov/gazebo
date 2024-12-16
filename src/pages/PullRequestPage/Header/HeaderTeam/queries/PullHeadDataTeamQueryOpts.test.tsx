import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { PullHeadDataTeamQueryOpts } from './PullHeadDataTeamQueryOpts'

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

describe('usePullHeadDataTeam', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('PullHeadDataTeam', () => {
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
              useQueryV5(
                PullHeadDataTeamQueryOpts({
                  provider: 'gh',
                  owner: 'codecov',
                  repo: 'cool-repo',
                  pullId: '1',
                })
              ),
            { wrapper }
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
              useQueryV5(
                PullHeadDataTeamQueryOpts({
                  provider: 'gh',
                  owner: 'codecov',
                  repo: 'cool-repo',
                  pullId: '1',
                })
              ),
            { wrapper }
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
      const oldConsoleError = console.error

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
            useQueryV5(
              PullHeadDataTeamQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                pullId: '1',
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

      it('throws a 403', async () => {
        setup({ isOwnerNotActivatedError: true })
        const { result } = renderHook(
          () =>
            useQueryV5(
              PullHeadDataTeamQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                pullId: '1',
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

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useQueryV5(
              PullHeadDataTeamQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                repo: 'cool-repo',
                pullId: '1',
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
  })
})
