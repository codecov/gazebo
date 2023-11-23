import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useResyncUser } from './useResyncUser'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const server = setupServer()

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('useResyncUser', () => {
  let syncStatus = false

  function setup() {
    server.use(
      graphql.query('IsSyncing', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            me: {
              isSyncing: syncStatus,
            },
          })
        )
      }),
      graphql.mutation('SyncData', (req, res, ctx) => {
        syncStatus = true
        return res(
          ctx.status(200),
          ctx.data({
            syncWithGitProvider: {
              me: {
                isSyncing: syncStatus,
              },
            },
          })
        )
      })
    )
  }

  describe('when the hook is called and the syncing is not in progress', () => {
    beforeEach(() => {
      syncStatus = false
      setup()
    })

    it('returns syncing false', async () => {
      const { result } = renderHook(() => useResyncUser(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isSyncing).toBeFalsy())
    })
  })

  describe('when the user trigger a sync', () => {
    beforeEach(() => {
      syncStatus = false
      setup()
    })

    it('returns syncing true', async () => {
      const { result } = renderHook(() => useResyncUser(), {
        wrapper: wrapper(),
      })

      result.current.triggerResync()

      await waitFor(() => expect(result.current.isSyncing).toBeTruthy())
    })
  })

  describe('when the hook is called and the syncing is in progress', () => {
    beforeEach(() => {
      syncStatus = true
      setup()
    })

    it('returns syncing true', async () => {
      const { result } = renderHook(() => useResyncUser(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isSyncing).toBeTruthy())
    })
  })

  describe('when a sync finishes', () => {
    beforeEach(() => {
      syncStatus = true
      setup()
    })

    it('returns syncing false', async () => {
      const { result } = renderHook(() => useResyncUser(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isSyncing).toBe(true))
      // sync on server finishes
      syncStatus = false
      // and wait for the request to get the new isSyncing
      await waitFor(() => expect(result.current.isSyncing).toBe(false), {
        // we need to make a longer timeout because the polling of the
        // isSyncing is 2000ms; and we can't use fake timers as it
        // doesn't work well with waitFor()
        timeout: 3000,
      })

      await waitFor(() => expect(result.current.isSyncing).toBeFalsy())
    })

    it('calls refetchQueries for repos', async () => {
      const refetchQueriesSpy = jest.spyOn(queryClient, 'refetchQueries')

      const { result } = renderHook(() => useResyncUser(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isSyncing).toBe(true))
      // sync on server finishes
      syncStatus = false
      // and wait for the request to get the new isSyncing
      await waitFor(() => expect(result.current.isSyncing).toBe(false), {
        // we need to make a longer timeout because the polling of the
        // isSyncing is 2000ms; and we can't use fake timers as it
        // doesn't work well with waitFor()
        timeout: 3000,
      })

      await waitFor(() =>
        expect(refetchQueriesSpy).toHaveBeenCalledWith({ queryKey: ['repos'] })
      )
    })
  })
})
