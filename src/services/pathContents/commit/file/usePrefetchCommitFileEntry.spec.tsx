import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePrefetchCommitFileEntry } from './usePrefetchCommitFileEntry'

const mockData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        commitid: 'f00162848a3cebc0728d915763c2fd9e92132408',
        flagNames: ['a', 'b'],
        coverageFile: {
          isCriticalFile: true,
          hashedPath: 'hashed-path',
          content:
            'import pytest\nfrom path1 import index\n\ndef test_uncovered_if():\n    assert index.uncovered_if() == False\n\ndef test_fully_covered():\n    assert index.fully_covered() == True\n\n',
          coverage: [
            {
              line: 1,
              coverage: 'H',
            },
            {
              line: 2,
              coverage: 'P',
            },
            {
              line: 4,
              coverage: 'H',
            },
            {
              line: 5,
              coverage: 'M',
            },
            {
              line: 7,
              coverage: 'H',
            },
            {
              line: 8,
              coverage: 'H',
            },
          ],
        },
      },
      branch: null,
    },
  },
}

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

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: Infinity,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter
    initialEntries={['/gh/codecov/test-repo/tree/main/src/file.js']}
  >
    <Route path="/:provider/:owner/:repo/tree/:branch/:path">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
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

describe('usePrefetchCommitFileEntry', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs) {
    const mockVars = jest.fn()

    server.use(
      graphql.query('CoverageForFile', (req, res, ctx) => {
        mockVars(req.variables)

        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockData))
        }
      })
    )

    return { mockVars }
  }

  describe('returns repository typename of Repository', () => {
    it('returns runPrefetch function', () => {
      setup({})
      const { result } = renderHook(
        () =>
          usePrefetchCommitFileEntry({
            commitSha: 'f00162848a3cebc0728d915763c2fd9e92132408',
            path: 'src/file.js',
          }),
        { wrapper }
      )

      expect(result.current.runPrefetch).toBeDefined()
      expect(typeof result.current.runPrefetch).toBe('function')
    })

    it('queries the api', async () => {
      setup({})
      const { result } = renderHook(
        () =>
          usePrefetchCommitFileEntry({
            commitSha: 'f00162848a3cebc0728d915763c2fd9e92132408',
            path: 'src/file.js',
          }),
        { wrapper }
      )

      await result.current.runPrefetch()

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<any>

      const expectedResponse = {
        content: mockData.owner.repository.commit.coverageFile.content,
        coverage: {
          '1': 'H',
          '2': 'P',
          '4': 'H',
          '5': 'M',
          '7': 'H',
          '8': 'H',
        },
        flagNames: ['a', 'b'],
        hashedPath: 'hashed-path',
        isCriticalFile: true,
        totals: 0,
      }

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.data).toStrictEqual(
          expectedResponse
        )
      )
    })

    describe('there is a null owner', () => {
      it('returns a null value', async () => {
        setup({ isNullOwner: true })
        const { result } = renderHook(
          () =>
            usePrefetchCommitFileEntry({
              commitSha: 'f00162848a3cebc0728d915763c2fd9e92132408',
              path: 'src/file.js',
            }),
          { wrapper }
        )

        await result.current.runPrefetch()

        const queryKey = queryClient
          .getQueriesData({})
          ?.at(0)
          ?.at(0) as Array<any>

        await waitFor(() =>
          expect(queryClient?.getQueryState(queryKey)?.data).toBe(null)
        )
      })
    })

    describe('flags arg is passed', () => {
      it('fetches with passed variables', async () => {
        const { mockVars } = setup({})
        const { result } = renderHook(
          () =>
            usePrefetchCommitFileEntry({
              commitSha: 'f00162848a3cebc0728d915763c2fd9e92132408',
              path: 'src/file.js',
              flags: ['flag-1', 'flag-2'],
            }),
          { wrapper }
        )

        await result.current.runPrefetch()

        await waitFor(() => expect(mockVars).toBeCalled())
        await waitFor(() =>
          expect(mockVars).toBeCalledWith(
            expect.objectContaining({ flags: ['flag-1', 'flag-2'] })
          )
        )
      })
    })
  })

  describe('returns NotFoundError __typename', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('throws a 404', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(
        () =>
          usePrefetchCommitFileEntry({
            commitSha: 'f00162848a3cebc0728d915763c2fd9e92132408',
            path: 'src/file.js',
          }),
        { wrapper }
      )

      await result.current.runPrefetch()

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<any>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })

  describe('returns OwnerNotActivatedError __typename', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('throws a 403', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(
        () =>
          usePrefetchCommitFileEntry({
            commitSha: 'f00162848a3cebc0728d915763c2fd9e92132408',
            path: 'src/file.js',
          }),
        { wrapper }
      )

      await result.current.runPrefetch()

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<any>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 403,
          })
        )
      )
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(
        () =>
          usePrefetchCommitFileEntry({
            commitSha: 'f00162848a3cebc0728d915763c2fd9e92132408',
            path: 'src/file.js',
          }),
        { wrapper }
      )

      await result.current.runPrefetch()

      const queryKey = queryClient
        .getQueriesData({})
        ?.at(0)
        ?.at(0) as Array<any>

      await waitFor(() =>
        expect(queryClient?.getQueryState(queryKey)?.error).toEqual(
          expect.objectContaining({
            status: 404,
          })
        )
      )
    })
  })
})
