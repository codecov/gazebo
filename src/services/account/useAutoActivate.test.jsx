import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAutoActivate } from './useAutoActivate'

const server = setupServer()
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

const provider = 'gh'
const owner = 'codecov'

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

describe('useAutoActivate', () => {
  let onSuccess = vi.fn()
  const opts = {
    onSuccess,
  }

  describe('options is set', () => {
    function setup() {
      server.use(
        http.patch(
          `/internal/${provider}/${owner}/account-details/`,
          (info) => {
            return HttpResponse.json({})
          }
        )
      )
    }

    describe('when called', () => {
      it('opts are passed through to react-query', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
              opts,
            }),
          { wrapper: wrapper() }
        )

        result.current.mutate(true)

        await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
      })

      it('accountDetails cache unchanged', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
              opts,
            }),
          { wrapper: wrapper() }
        )

        result.current.mutate(true)

        await waitFor(() =>
          expect(queryClient.isFetching(['accountDetails'])).toBe(0)
        )
      })

      it('users cache unchanged', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
              opts,
            }),
          { wrapper: wrapper() }
        )

        result.current.mutate(true)

        await waitFor(() => expect(queryClient.isFetching(['users'])).toBe(0))
      })
    })
  })

  describe('opts is not set', () => {
    function setup() {
      server.use(
        http.patch(
          `/internal/${provider}/${owner}/account-details/`,
          (info) => {
            return HttpResponse.json({})
          }
        )
      )
    }

    describe('when called', () => {
      it('accountDetails cache unchanged', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
            }),
          { wrapper: wrapper() }
        )

        result.current.mutate(true)

        await waitFor(() =>
          expect(queryClient.isFetching(['accountDetails'])).toBe(0)
        )
      })

      it('users cache unchanged', async () => {
        setup()
        const { result } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
            }),
          { wrapper: wrapper() }
        )

        result.current.mutate(true)

        await waitFor(() => expect(queryClient.isFetching(['users'])).toBe(0))
      })
    })
  })
})
