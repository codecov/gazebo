import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSelfHostedSettings } from './useSelfHostedSettings'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const mockResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      planAutoActivate: true,
      seatsUsed: 1,
      seatsLimit: 10,
    },
  },
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
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

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
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

describe('useSelfHostedSettings', () => {
  function setup({
    invalidResponse = false,
    ownerNotActivated = false,
    notFoundResponse = false,
  }) {
    server.use(
      graphql.query('SelfHostedSettings', (req, res, ctx) => {
        if (invalidResponse) {
          return res(ctx.status(200), ctx.data({}))
        } else if (ownerNotActivated) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (notFoundResponse) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        }
        return res(ctx.status(200), ctx.data(mockResponse))
      })
    )
  }

  describe('when called', () => {
    it('returns data', async () => {
      setup({})
      const { result } = renderHook(() => useSelfHostedSettings(), { wrapper })

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          __typename: 'Repository',
          planAutoActivate: true,
          seatsUsed: 1,
          seatsLimit: 10,
        })
      )
    })
  })

  describe('invalid response', () => {
    beforeAll(() => {
      console.error = () => {}
    })

    it('rejects with 404', async () => {
      setup({ invalidResponse: true })
      const { result } = renderHook(() => useSelfHostedSettings(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          status: 404,
          dev: 'useSelfHostedSettings - 404 schema parsing failed',
        })
      )
    })
  })

  describe('owner not activated', () => {
    beforeAll(() => {
      console.error = () => {}
    })

    it('rejects with 403', async () => {
      setup({ ownerNotActivated: true })
      const { result } = renderHook(() => useSelfHostedSettings(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          status: 403,
          dev: 'useSelfHostedSettings - 403 OwnerNotActivatedError',
        })
      )
    })
  })

  describe('not found error', () => {
    beforeAll(() => {
      console.error = () => {}
    })

    it('rejects with 404', async () => {
      setup({ notFoundResponse: true })
      const { result } = renderHook(() => useSelfHostedSettings(), {
        wrapper,
      })

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      expect(result.current.error).toEqual(
        expect.objectContaining({
          status: 404,
          dev: 'useSelfHostedSettings - 404 NotFoundError',
        })
      )
    })
  })
})
