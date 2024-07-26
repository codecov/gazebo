import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { POLLING_INTERVAL, useResyncUser } from './useResyncUser'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()

const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')
const getQueriesDataSpy = jest.spyOn(queryClient, 'getQueriesData')

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

    it('calls invalidate queries on each sync', async () => {
      jest.useFakeTimers()
      const { result } = renderHook(() => useResyncUser(), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.isSyncing).toBe(true))

      await waitFor(() => expect(invalidateQueriesSpy).toHaveBeenCalledTimes(2))

      // For some reason number of called times is doubling; but when console logging within the queryFn we see
      // that the loop is being entered the correct number of times. This may be some jest weirdness
      jest.advanceTimersByTime(POLLING_INTERVAL)

      await waitFor(() => expect(invalidateQueriesSpy).toHaveBeenCalledTimes(4))

      // Mock returning the data returned being as large as the page size
      getQueriesDataSpy.mockReturnValue([
        0,
        { pages: { repos: Array.from({ length: 20 }) } },
      ])

      jest.advanceTimersByTime(POLLING_INTERVAL)

      await waitFor(() => expect(invalidateQueriesSpy).toHaveBeenCalledTimes(5))

      // Confirm that we don't call the query anymore after we've reached the page size
      jest.advanceTimersByTime(POLLING_INTERVAL)

      await waitFor(() => expect(invalidateQueriesSpy).toHaveBeenCalledTimes(5))

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

      // Call one extra time on success
      await waitFor(() => expect(invalidateQueriesSpy).toHaveBeenCalledTimes(6))
      jest.useRealTimers()
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

    it('calls invalidateQueries for repos', async () => {
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
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['repos', 'gh', undefined],
        })
      )
    })
  })
})
