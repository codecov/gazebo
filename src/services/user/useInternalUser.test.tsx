import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useInternalUser } from './useInternalUser'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

describe('useInternalUser', () => {
  function setup(hasError = false) {
    server.use(
      http.get('/internal/user', (info) => {
        if (hasError) {
          return HttpResponse.json({}, { status: 400 })
        }
        return HttpResponse.json({
          email: 'cool@email.com',
          name: 'cool-user',
          externalId: '1234',
          termsAgreement: false,
          owners: [],
        })
      })
    )
  }

  describe('calling hook', () => {
    it('returns api response', async () => {
      setup()
      const { result } = renderHook(() => useInternalUser({}), { wrapper })

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          email: 'cool@email.com',
          name: 'cool-user',
          externalId: '1234',
          owners: [],
          termsAgreement: false,
        })
      )
    })
  })

  describe('when hook call errors', () => {
    it('returns empty object', async () => {
      setup(true)
      const { result } = renderHook(() => useInternalUser({}), { wrapper })

      await waitFor(() => expect(result.current.data).toStrictEqual({}))
    })
  })
})
