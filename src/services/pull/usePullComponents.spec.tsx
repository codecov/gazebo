import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { usePullComponents } from './usePullComponents'

const mockCompareData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'Comparison',
          componentComparisons: [
            {
              name: 'component1',
            },
            {
              name: 'component2',
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

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/pull/9']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
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
}

describe('usePullComponents', () => {
  function setup({
    isUnsuccessfulParseError = false,
    isNullOwner = false,
  }: SetupArgs = {}) {
    server.use(
      graphql.query('PullComponentsSelector', (req, res, ctx) => {
        if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else if (isNullOwner) {
          return res(ctx.status(200), ctx.data(mockNullOwner))
        } else {
          return res(ctx.status(200), ctx.data(mockCompareData))
        }
      })
    )
  }

  describe('api returns valid response', () => {
    it('returns components info', async () => {
      setup()
      const { result } = renderHook(() => usePullComponents(), { wrapper })

      const expectedResult = {
        pull: {
          compareWithBase: {
            __typename: 'Comparison',
            componentComparisons: [
              {
                name: 'component1',
              },
              {
                name: 'component2',
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

      const { result } = renderHook(() => usePullComponents(), { wrapper })

      await waitFor(() => expect(result.current.data).toBeUndefined())
    })
  })

  describe('unsuccessful parse of zod schema', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error')
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('throws a 404', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(() => usePullComponents(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {
              message: 'Error parsing pull components selector data',
            },
          })
        )
      )
    })
  })
})
