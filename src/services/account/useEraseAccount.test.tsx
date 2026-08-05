import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import Cookie from 'js-cookie'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Api from 'shared/api'

import { useEraseAccount } from './useEraseAccount'

const mockAddToast = vi.fn()
vi.mock('js-cookie')
vi.mock('services/toastNotification/context', () => ({
  useAddNotification: () => mockAddToast,
}))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const provider = 'gh'
const owner = 'codecov'

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  error?: { __typename: string; message: string } | null
}

describe('useEraseAccount', () => {
  function setup({ error = null }: SetupArgs = {}) {
    server.use(
      graphql.mutation('DeleteOwner', () => {
        return HttpResponse.json({ data: { deleteOwner: { error } } })
      })
    )
  }

  describe('when the mutation succeeds', () => {
    it('deletes the auth cookie', async () => {
      setup()
      const { result } = renderHook(
        () => useEraseAccount({ provider, owner }),
        { wrapper: wrapper() }
      )

      result.current.mutate()

      await waitFor(() =>
        expect(Cookie.remove).toHaveBeenCalledWith('github-token')
      )
    })

    it('redirects to the home page', async () => {
      const location = window.location
      // @ts-expect-error - deleting for test mock
      delete window.location
      window.location = { ...location, href: '' }

      setup()
      const { result } = renderHook(
        () => useEraseAccount({ provider, owner }),
        { wrapper: wrapper() }
      )

      result.current.mutate()

      await waitFor(() => expect(window.location.href).toBe('/'))

      window.location = location
    })
  })

  describe('when the mutation returns an error', () => {
    it('surfaces an error toast', async () => {
      setup({ error: { __typename: 'UnauthorizedError', message: 'nope' } })
      const { result } = renderHook(
        () => useEraseAccount({ provider, owner }),
        { wrapper: wrapper() }
      )

      result.current.mutate()

      await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })
  })

  describe('when the mutation request fails', () => {
    it('surfaces an error toast', async () => {
      vi.spyOn(Api, 'graphqlMutation').mockRejectedValueOnce(new Error('fail'))
      const { result } = renderHook(
        () => useEraseAccount({ provider, owner }),
        { wrapper: wrapper() }
      )

      result.current.mutate()

      await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })
  })
})
