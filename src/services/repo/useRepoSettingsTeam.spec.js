import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoSettingsTeam } from './useRepoSettingsTeam'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }) => (
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

describe('useRepoSettingsTeam', () => {
  function setup(data) {
    server.use(
      graphql.query('GetRepoSettingsTeam', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )
  }

  describe('when called with successful res', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            defaultBranch: 'master',
            private: true,
            uploadToken: 'token',
            graphToken: 'token',
            yaml: 'yaml',
            bot: {
              username: 'test',
            },
          },
        },
      })
    })
    afterEach(() => server.resetHandlers())

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(() => useRepoSettingsTeam(), {
          wrapper,
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            repository: {
              defaultBranch: 'master',
              private: true,
              uploadToken: 'token',
              graphToken: 'token',
              yaml: 'yaml',
              bot: {
                username: 'test',
              },
            },
          })
        )
      })
    })
  })

  describe('when called with unsuccessful res', () => {
    beforeEach(() => {
      setup({})
    })

    it('returns the data', async () => {
      const { result } = renderHook(() => useRepoSettingsTeam(), {
        wrapper,
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual({}))
    })
  })
})
