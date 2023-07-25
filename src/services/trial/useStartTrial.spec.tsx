import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { renderToast } from 'services/toast'

import { useStartTrial } from './useStartTrial'

jest.mock('services/toast')

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
    queries: { retry: false },
  },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
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
  isOtherError?: boolean
  isServerError?: boolean
}

describe('useStartTrial', () => {
  function setup({ isOtherError = false, isServerError = false }: SetupArgs) {
    const variablesPassed = jest.fn()
    const mockRenderToast = renderToast as jest.Mock

    server.use(
      graphql.mutation('startTrial', (req, res, ctx) => {
        variablesPassed(req.variables)
        if (isOtherError) {
          return res(
            ctx.status(200),
            ctx.data({ startTrial: { error: { message: 'Other Error' } } })
          )
        }

        if (isServerError) {
          return res(
            ctx.status(500),
            ctx.errors([{ message: 'Internal Server Error' }])
          )
        }

        return res(ctx.status(200), ctx.data({ startTrial: null }))
      })
    )

    return { variablesPassed, mockRenderToast }
  }

  describe('calling mutation', () => {
    describe('a successful mutation', () => {
      it('passes the correct args', async () => {
        const { variablesPassed } = setup({})

        const { result } = renderHook(
          () => useStartTrial({ owner: 'codecov' }),
          { wrapper }
        )

        result.current.mutate()

        await waitFor(() =>
          expect(variablesPassed).toBeCalledWith({
            input: { orgUsername: 'codecov' },
          })
        )
      })

      it('triggers render toast', async () => {
        const { mockRenderToast } = setup({})

        const { result } = renderHook(
          () => useStartTrial({ owner: 'codecov' }),
          { wrapper }
        )

        result.current.mutate()

        await waitFor(() =>
          expect(mockRenderToast).not.toBeCalledWith({
            type: 'error',
            title: 'Error starting trial',
            content:
              'Please try again. If the error persists please contact support',
            options: {
              duration: 10000,
            },
          })
        )

        await waitFor(() =>
          expect(mockRenderToast).toBeCalledWith({
            type: 'generic',
            title: '14 day trial has started',
            content: '',
            options: {
              duration: 5000,
              position: 'bottom-left',
            },
          })
        )
      })
    })

    describe('an unsuccessful mutation', () => {
      beforeAll(() => {
        console.error = () => null
      })

      describe('handled server error', () => {
        it('triggers render toast', async () => {
          const { mockRenderToast } = setup({ isOtherError: true })

          const { result } = renderHook(
            () => useStartTrial({ owner: 'codecov' }),
            { wrapper }
          )

          result.current.mutate()

          await waitFor(() =>
            expect(mockRenderToast).toBeCalledWith({
              type: 'error',
              title: 'Error starting trial',
              content:
                'Please try again. If the error persists please contact support',
              options: {
                duration: 10000,
              },
            })
          )

          await waitFor(() =>
            expect(mockRenderToast).not.toBeCalledWith({
              type: 'generic',
              title: '14 day trial has started',
              content: '',
              options: {
                duration: 5000,
                position: 'bottom-left',
              },
            })
          )
        })
      })

      describe('internal server error', () => {
        it('triggers toast', async () => {
          const { mockRenderToast } = setup({ isServerError: true })

          const { result } = renderHook(
            () => useStartTrial({ owner: 'codecov' }),
            { wrapper }
          )

          result.current.mutate()

          await waitFor(() =>
            expect(mockRenderToast).toBeCalledWith({
              type: 'error',
              title: 'Error starting trial',
              content:
                'Please try again. If the error persists please contact support',
              options: {
                duration: 10000,
              },
            })
          )
        })
      })
    })
  })
})
