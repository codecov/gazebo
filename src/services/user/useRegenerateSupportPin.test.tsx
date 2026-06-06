import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import * as apiHelpers from 'shared/api/rejectNetworkError'

import { useRegenerateSupportPin } from './useRegenerateSupportPin'

vi.mock('shared/api/rejectNetworkError')

const mocks = {
  rejectNetworkError: vi.spyOn(apiHelpers, 'rejectNetworkError'),
}

const mockData = {
  regenerateSupportPin: {
    me: {
      supportPin: '123456',
    },
    error: null,
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  vi.resetAllMocks()
})
afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRegenerateSupportPin', () => {
  type SetupArgs = {
    regenerateSupportPin: {
      me?: { supportPin?: string | null } | null
      error?: { __typename: string } | null
    }
  }

  function setup({ data = mockData }: { data?: SetupArgs } = {}) {
    server.use(
      graphql.mutation('RegenerateSupportPin', () => {
        return HttpResponse.json({ data })
      })
    )
  }

  describe('when calling the mutation', () => {
    describe('when mutation is a success', () => {
      beforeEach(() => {
        setup()
      })

      it('returns isSuccess true', async () => {
        const { result } = renderHook(() => useRegenerateSupportPin(), {
          wrapper,
        })

        result.current.mutate()
        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })

    describe('when schema parse fails', () => {
      beforeEach(() => {
        setup({
          data: {
            regenerateSupportPin: {
              error: { __typename: 'UnexpectedError' },
            },
          },
        })
      })

      it('throws a network error', async () => {
        const { result } = renderHook(() => useRegenerateSupportPin(), {
          wrapper,
        })

        result.current.mutate()
        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(mocks.rejectNetworkError).toHaveBeenCalledWith(
          expect.objectContaining({ errorName: 'Parsing Error' })
        )
      })
    })
  })
})
