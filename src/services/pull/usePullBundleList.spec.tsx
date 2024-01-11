import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePullBundleList } from './usePullBundleList'

const mockPullBundleListData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          bundles: [
            {
              name: 'bundle.js',
              changeType: 'added',
              sizeDelta: 1,
              sizeTotal: 2,
              loadTimeDelta: 3,
              loadTimeTotal: 4,
            },
            {
              name: 'bundle.css',
              changeType: 'removed',
              sizeDelta: 5,
              sizeTotal: 6,
              loadTimeDelta: 7,
              loadTimeTotal: 8,
            },
          ],
        },
      },
    },
  },
}

const mockNullOwner = {
  owner: null,
}

const mockUnsuccessfulParseError = {}

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
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  isUnsuccessfulParseError?: boolean
  isNullOwner?: boolean
  isOwnerNotActivatedError?: boolean
  isNotFoundError?: boolean
}

describe('usePullBundleList', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isNullOwner = false,
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
  }: SetupArgs = {}) {
    server.use(
      graphql.query('PullBundleList', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockPullBundleListData))
        }
      })
    )
  }

  describe('api returns valid response', () => {
    it('returns pull summary data', async () => {
      setup()
      const { result } = renderHook(
        () =>
          usePullBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      const expectedResult = {
        pull: {
          bundleAnalysisCompareWithBase: {
            __typename: 'BundleAnalysisComparison',
            bundles: [
              {
                name: 'bundle.js',
                changeType: 'added',
                sizeDelta: 1,
                sizeTotal: 2,
                loadTimeDelta: 3,
                loadTimeTotal: 4,
              },
              {
                name: 'bundle.css',
                changeType: 'removed',
                sizeDelta: 5,
                sizeTotal: 6,
                loadTimeDelta: 7,
                loadTimeTotal: 8,
              },
            ],
          },
        },
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedResult)
      )
    })
  })

  describe('there is a null owner', () => {
    it('returns a null value', async () => {
      setup({ isNullOwner: true })
      const { result } = renderHook(
        () =>
          usePullBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({ pull: null })
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
          usePullBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: null,
          })
        )
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
          usePullBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
          }),
        { wrapper }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {},
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
          usePullBundleList({
            provider: 'github',
            owner: 'codecov',
            repo: 'test-repo',
            pullId: 123,
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
})
