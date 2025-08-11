import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useInternalUser } from './useInternalUser'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
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

interface SetupArgs {
  hasError?: boolean
  parsingError?: boolean
}

describe('useInternalUser', () => {
  function setup({ hasError = false, parsingError = false }: SetupArgs) {
    server.use(
      http.get('/internal/user', () => {
        if (hasError) {
          return HttpResponse.json({}, { status: 400 })
        } else if (parsingError) {
          return HttpResponse.json({ email: 123 }, { status: 200 })
        }
        return HttpResponse.json({
          email: 'cool@email.com',
          name: 'cool-user',
          externalId: '1234',
          termsAgreement: false,
          owners: [],
          defaultOrg: null,
        })
      })
    )
  }

  describe('calling hook', () => {
    it('returns api response', async () => {
      setup({})
      const { result } = renderHook(() => useInternalUser({}), { wrapper })

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          email: 'cool@email.com',
          name: 'cool-user',
          externalId: '1234',
          owners: [],
          termsAgreement: false,
          defaultOrg: null,
        })
      )
    })
  })

  describe('when hook call errors', () => {
    describe('there is a network error', () => {
      it('returns empty object', async () => {
        setup({ hasError: true })
        const { result } = renderHook(() => useInternalUser({}), { wrapper })

        await waitFor(() => expect(result.current.data).toStrictEqual({}))
      })
    })

    describe('there is a parsing error', () => {
      beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        vi.resetAllMocks()
      })

      it('returns empty object', async () => {
        setup({ parsingError: true })
        const { result } = renderHook(() => useInternalUser({}), { wrapper })

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'useInternalUser - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })
})
