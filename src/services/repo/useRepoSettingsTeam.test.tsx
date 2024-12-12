import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { MockInstance } from 'vitest'

import { useRepoSettingsTeam } from './useRepoSettingsTeam'

console.error = () => {}

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
    isCurrentUserPartOfOrg: null,
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
    },
  },
}

const mockIncorrectResponse = {
  owner: {
    isCurrentUserPartOfOrg: false,
    repository: {
      invalid: 'invalid',
    },
  },
}

const mockResponse = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      defaultBranch: 'master',
      private: true,
      uploadToken: 'token',
      graphToken: 'token',
      yaml: 'yaml',
      bot: {
        username: 'test',
      },
      activated: true,
    },
  },
}

describe('useRepoSettingsTeam', () => {
  function setup({
    isNotFoundError = false,
    isUnsuccessfulParseError = false,
  }) {
    server.use(
      graphql.query('GetRepoSettingsTeam', () => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockIncorrectResponse })
        }
        return HttpResponse.json({ data: mockResponse })
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
        const { result } = renderHook(() => useRepoSettingsTeam(), {
          wrapper,
        })

        await waitFor(() =>
          expect(result.current.data).toEqual({
            isCurrentUserPartOfOrg: true,
            repository: {
              __typename: 'Repository',
              defaultBranch: 'master',
              private: true,
              uploadToken: 'token',
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
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns a failed to parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(() => useRepoSettingsTeam(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useRepoSettingsTeam - 404 schema parsing failed',
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
      const { result } = renderHook(() => useRepoSettingsTeam(), {
        wrapper,
      })

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
})
