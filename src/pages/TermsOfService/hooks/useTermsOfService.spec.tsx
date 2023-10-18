import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSaveTermsAgreement } from './useTermsOfService'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>
const wrapper: WrapperClosure =
  (initialEntries = ['/gh']) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useSaveTermsAgreement', () => {
  interface Setup {
    apiError?: boolean
  }
  function setup({ apiError = false }: Setup = { apiError: false }) {
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

  afterEach(() => jest.resetAllMocks())

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
        })

        await waitFor(() => expect(successFn).toBeCalledWith('completed'))

        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['InternalUser'],
        })
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
        })

        await waitFor(() => expect(successFn).toBeCalledWith('completed'))

        expect(invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['InternalUser'],
        })
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
        })

        await waitFor(() =>
          expect(spyErrorMock).toBeCalledWith('POST /graphql/ net::ERR_FAILED')
        )

        expect(errorFn).toBeCalledWith('error')
      })
    })
  })
})
