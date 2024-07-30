import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { useSaveTermsAgreement } from './useTermsOfService'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (initialEntries = ['/gh']): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider">{children}</Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  apiError?: boolean
}

describe('useSaveTermsAgreement', () => {
  function setup({ apiError = false }: SetupArgs = { apiError: false }) {
    server.use(
      graphql.mutation('SigningTermsAgreement', (req, res, ctx) => {
        if (apiError) {
          return res.networkError('Failed to connect')
        }
        return res(ctx.status(200), ctx.data({}))
      }),
      graphql.query('CurrentUser', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            me: {
              username: '123',
            },
          })
        )
      })
    )
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('when query resolves', () => {
    describe('basic sign', () => {
      it('makes a mutation', async () => {
        setup()
        const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
        const successFn = jest.fn()
        const { result } = renderHook(
          () =>
            useSaveTermsAgreement({
              onSuccess: () => {
                successFn('completed')
              },
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate({
          businessEmail: 'test@test.com',
          termsAgreement: true,
          customerIntent: 'PERSONAL',
        })

        await waitFor(() => expect(successFn).toHaveBeenCalledWith('completed'))

        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['InternalUser'],
        })
      })

      it('redirects to /', async () => {
        setup()
        const { result } = renderHook(() => useSaveTermsAgreement({}), {
          wrapper: wrapper(),
        })

        result.current.mutate({
          businessEmail: 'test@test.com',
          termsAgreement: true,
          customerIntent: 'PERSONAL',
        })

        await waitFor(() => expect(testLocation.pathname).toEqual('/'))
      })
    })

    describe('sign with default org', () => {
      it('makes a mutation', async () => {
        setup()
        const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
        const successFn = jest.fn()
        const { result } = renderHook(
          () =>
            useSaveTermsAgreement({
              onSuccess: () => {
                successFn('completed')
              },
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate({
          businessEmail: 'test@test.com',
          termsAgreement: true,
          customerIntent: 'PERSONAL',
        })

        await waitFor(() => expect(successFn).toHaveBeenCalledWith('completed'))

        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['InternalUser'],
        })
      })

      it('redirects to /', async () => {
        setup()
        const { result } = renderHook(() => useSaveTermsAgreement({}), {
          wrapper: wrapper(),
        })

        result.current.mutate({
          businessEmail: 'test@test.com',
          termsAgreement: true,
          customerIntent: 'PERSONAL',
        })

        await waitFor(() => expect(testLocation.pathname).toEqual('/'))
      })
    })

    it('proceeds with mutation on missing email', async () => {
      setup()
      const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries')
      const successFn = jest.fn()
      const { result } = renderHook(
        () =>
          useSaveTermsAgreement({
            onSuccess: () => {
              successFn('completed')
            },
          }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate({
        businessEmail: null,
        termsAgreement: true,
        customerIntent: 'PERSONAL',
      })

      await waitFor(() => expect(successFn).toHaveBeenCalledWith('completed'))

      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['InternalUser'],
      })
    })

    describe('there is was an api error', () => {
      it('throws an error', async () => {
        setup({ apiError: true })
        const spy = jest.spyOn(console, 'error')
        const spyErrorMock = jest.fn()
        spy.mockImplementation(spyErrorMock)
        const errorFn = jest.fn()
        const { result } = renderHook(
          () =>
            useSaveTermsAgreement({
              onError: () => {
                errorFn('error')
              },
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate({
          businessEmail: 'test@test.com',
          termsAgreement: true,
          customerIntent: 'PERSONAL',
        })

        await waitFor(() =>
          expect(spyErrorMock).toHaveBeenCalledWith(
            'POST /graphql/ net::ERR_FAILED'
          )
        )

        expect(errorFn).toHaveBeenCalledWith('error')
      })

      it('does not redirect to /', async () => {
        setup({ apiError: true })
        const spy = jest.spyOn(console, 'error')
        const spyErrorMock = jest.fn()
        spy.mockImplementation(spyErrorMock)
        const errorFn = jest.fn()
        const { result } = renderHook(
          () =>
            useSaveTermsAgreement({
              onError: () => {
                errorFn('error')
              },
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate({
          businessEmail: 'test@test.com',
          termsAgreement: true,
          customerIntent: 'PERSONAL',
        })

        await waitFor(() => expect(testLocation.pathname).toEqual('/gh'))
      })
    })
  })
})
