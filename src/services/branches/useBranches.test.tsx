import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

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
      graphql.query('GetBranches', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else if (isNullOwner) {
          return HttpResponse.json({ data: mockNullOwnerData })
        }

        const branchData = info.variables?.after ? branch2 : branch1
        const hasNextPage = info.variables?.after ? false : true
        const endCursor = info.variables?.after ? 'second' : 'first'

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
        return HttpResponse.json({ data: queryData })
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
            { wrapper }
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
            { wrapper }
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
          { wrapper }
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
        () => useBranches({ provider, owner, repo }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useBranches - 404 NotFoundError',
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
        () => useBranches({ provider, owner, repo }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 403,
            dev: 'useBranches - 403 OwnerNotActivatedError',
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
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
        () => useBranches({ provider, owner, repo }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useBranches - 404 schema parsing failed',
          })
        )
      )
    })
  })
})
