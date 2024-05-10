import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoSettings } from './useRepoSettings'

console.error = () => {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

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

const mockIncorrectResponse = {
  owner: {
    repository: {
      invalid: 'invalid',
    },
  },
}

const mockResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      defaultBranch: 'master',
      private: true,
      uploadToken: 'token',
      profilingToken: 'token',
      staticAnalysisToken: 'static analysis token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
      activated: true,
    },
  },
}

describe('useRepoSettings', () => {
  function setup({
    isNotFoundError = false,
    isOwnerNotActivatedError = false,
    isUnsuccessfulParseError = false,
  }) {
    server.use(
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        if (isNotFoundError) {
          return res(ctx.status(200), ctx.data(mockNotFoundError))
        } else if (isOwnerNotActivatedError) {
          return res(ctx.status(200), ctx.data(mockOwnerNotActivatedError))
        } else if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockIncorrectResponse))
        }
        return res(ctx.status(200), ctx.data(mockResponse))
      })
    )
  }

  describe('when called with successful res', () => {
    beforeEach(() => {
      setup({})
    })
    afterEach(() => server.resetHandlers())

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(() => useRepoSettings(), {
          wrapper,
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            repository: {
              __typename: 'Repository',

              defaultBranch: 'master',
              private: true,
              uploadToken: 'token',
              profilingToken: 'token',
              staticAnalysisToken: 'static analysis token',
              graphToken: 'token',
              yaml: 'yaml',
              bot: {
                username: 'test',
              },
              activated: true,
            },
          })
        )
      })
    })
  })

  describe('when failed to parse data', () => {
    it('returns a failed to parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(() => useRepoSettings(), {
        wrapper,
      })
      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useRepoSettings - 404 schema parsing failed',
          })
        )
      )
    })
  })

  describe('when data not found', () => {
    it('returns a not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(() => useRepoSettings(), {
        wrapper,
      })
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

  describe('when owner is not activated', () => {
    it('returns an owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(() => useRepoSettings(), {
        wrapper,
      })
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
