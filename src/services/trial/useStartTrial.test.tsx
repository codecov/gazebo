import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useStartTrial } from './useStartTrial'

const mocks = vi.hoisted(() => ({
  useRedirect: vi.fn(),
  renderToast: vi.fn(),
}))

vi.mock('services/toast/renderToast', async () => {
  const actual = await vi.importActual('services/toast/renderToast')
  return {
    ...actual,
    renderToast: mocks.renderToast,
  }
})

vi.mock('shared/useRedirect', async () => {
  const actual = await vi.importActual('shared/useRedirect')
  return {
    ...actual,
    useRedirect: mocks.useRedirect,
  }
})

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
    const variablesPassed = vi.fn()
    const mockSetItem = vi.spyOn(window.localStorage.__proto__, 'setItem')
    const hardRedirect = vi.fn()
    mocks.useRedirect.mockImplementation((data) => ({
      hardRedirect: () => hardRedirect(data),
    }))

    server.use(
      graphql.mutation('startTrial', (info) => {
        variablesPassed(info.variables)
        if (isOtherError) {
          return HttpResponse.json({
            data: { startTrial: { error: { message: 'Other Error' } } },
          })
        }

        if (isServerError) {
          return HttpResponse.json(
            { errors: [{ message: 'Internal Server Error' }] },
            { status: 500 }
          )
        }

        return HttpResponse.json({ data: { startTrial: null } })
      })
    )

    return { variablesPassed, mockSetItem }
  }

  describe('calling mutation', () => {
    describe('a successful mutation', () => {
      it('passes the correct args', async () => {
        const { variablesPassed } = setup({})

        const { result } = renderHook(() => useStartTrial(), { wrapper })

        result.current.mutate({ owner: 'codecov' })

        await waitFor(() =>
          expect(variablesPassed).toHaveBeenCalledWith({
            input: { orgUsername: 'codecov' },
          })
        )
      })

      it('sets user started trial localstorage', async () => {
        const { mockSetItem } = setup({})
        const { result } = renderHook(() => useStartTrial(), { wrapper })

        result.current.mutate({ owner: 'codecov' })
        await waitFor(() => expect(mockSetItem).toHaveBeenCalled())
      })
    })

    describe('an unsuccessful mutation', () => {
      beforeAll(() => {
        console.error = () => null
      })

      describe('handled server error', () => {
        it('triggers render toast', async () => {
          setup({ isOtherError: true })

          const { result } = renderHook(() => useStartTrial(), { wrapper })

          result.current.mutate({ owner: 'codecov' })

          await waitFor(() =>
            expect(mocks.renderToast).toHaveBeenCalledWith({
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

      describe('internal server error', () => {
        it('triggers toast', async () => {
          setup({ isServerError: true })

          const { result } = renderHook(() => useStartTrial(), { wrapper })

          result.current.mutate({ owner: 'codecov' })

          await waitFor(() =>
            expect(mocks.renderToast).toHaveBeenCalledWith({
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
