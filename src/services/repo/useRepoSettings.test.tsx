import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { MockInstance } from 'vitest'

import { useRepoSettings } from './useRepoSettings'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()
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
      staticAnalysisToken: 'static analysis token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: { username: 'test' },
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
      graphql.query('GetRepoSettings', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isOwnerNotActivatedError) {
          return HttpResponse.json({ data: mockOwnerNotActivatedError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockIncorrectResponse })
        }
        return HttpResponse.json({ data: mockResponse })
      })
    )
  }

  describe('when called with successful res', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup({})
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
              staticAnalysisToken: 'static analysis token',
              graphToken: 'token',
              yaml: 'yaml',
              bot: { username: 'test' },
              activated: true,
            },
          })
        )
      })
    })
  })

  describe('when failed to parse data', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns a failed to parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(() => useRepoSettings(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'fetchRepoSettingsDetails - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })

  describe('when data not found', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns a not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(() => useRepoSettings(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'fetchRepoSettingsDetails - Not Found Error',
            status: 404,
          })
        )
      )
    })
  })

  describe('when owner is not activated', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns an owner not activated error', async () => {
      setup({ isOwnerNotActivatedError: true })
      const { result } = renderHook(() => useRepoSettings(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'fetchRepoSettingsDetails - Owner Not Activated',
            status: 403,
          })
        )
      )
    })
  })
})
