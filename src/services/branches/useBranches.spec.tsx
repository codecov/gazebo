import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBranches } from './useBranches'

const mockNotFoundError = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'NotFoundError',
      message: 'commit not found',
    },
  },
}

const mockOwnerNotActivatedError = {
  owner: {
    isCurrentUserPartOfOrg: true,
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

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const branch1 = {
  name: 'branch1',
  head: {
    commitid: '1',
  },
}

const branch2 = {
  name: 'branch2',
  head: {
    commitid: '2',
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

interface SetupArgs {
  isNotFoundError?: boolean
  isOwnerNotActivatedError?: boolean
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
}

describe('GetBranches', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetBranches', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwnerData))
        }

        const branchData = !!req.variables?.after ? branch2 : branch1
        const hasNextPage = req.variables?.after ? false : true
        const endCursor = req.variables?.after ? 'second' : 'first'

        const queryData = {
          owner: {
            repository: {
              __typename: 'Repository',
              branches: {
                edges: [
                  {
                    node: branchData,
                  },
                  null,
                ],
                pageInfo: {
                  hasNextPage,
                  endCursor,
                },
              },
            },
          },
        }

        return res(ctx.status(200), ctx.data(queryData))
      })
    )
  }

  describe('when __typename is Repository', () => {
    describe('valid data is returned', () => {
      describe('when data is loaded', () => {
        it('returns the data', async () => {
          setup({})
          const { result } = renderHook(
            () => useBranches({ provider, owner, repo }),
            {
              wrapper,
            }
          )

          await waitFor(() => expect(result.current.isSuccess).toBe(true))

          const expectedResponse = {
            branches: [
              {
                name: 'branch1',
                head: {
                  commitid: '1',
                },
              },
            ],
          }

          await waitFor(() =>
            expect(result.current.data).toEqual(expectedResponse)
          )
        })
      })

      describe('when fetchNextPage is called', () => {
        it('returns old data and new data combined', async () => {
          setup({})
          const { result } = renderHook(
            () => useBranches({ provider, owner, repo }),
            {
              wrapper,
            }
          )

          await waitFor(() => expect(result.current.status).toBe('success'))

          result.current.fetchNextPage()

          await waitFor(() => expect(result.current.status).toBe('success'))

          const expectedData = {
            branches: [
              {
                name: 'branch1',
                head: {
                  commitid: '1',
                },
              },
              {
                name: 'branch2',
                head: {
                  commitid: '2',
                },
              },
            ],
          }

          await waitFor(() =>
            expect(result.current.data).toStrictEqual(expectedData)
          )
        })
      })
    })

    describe('when null owner is returned', () => {
      it('returns an empty list', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () => useBranches({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(result.current.status).toBe('success'))

        result.current.fetchNextPage()

        await waitFor(() => expect(result.current.status).toBe('success'))

        const expectedData = { branches: [] }

        await waitFor(() =>
          expect(result.current.data).toStrictEqual(expectedData)
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
        () => useBranches({ provider, owner, repo }),
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
        () => useBranches({ provider, owner, repo }),
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
        () => useBranches({ provider, owner, repo }),
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
