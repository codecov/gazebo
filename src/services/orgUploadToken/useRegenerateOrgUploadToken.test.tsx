import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateOrgUploadToken } from './useRegenerateOrgUploadToken'
import { rejectNetworkError } from 'shared/api/helpers'

vi.mock('shared/api/helpers', () => ({
  rejectNetworkError: vi.fn(),
}))

vi.mock(import('shared/api/helpers'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    rejectNetworkError: vi.fn(),
  }
})

const mocks = {
  rejectNetworkError: vi.mocked(rejectNetworkError),
}

const mockData = {
  regenerateOrgUploadToken: {
    orgUploadToken: 'new token',
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
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRegenerateOrgUploadToken', () => {
  type SetupArgs = {
    regenerateOrgUploadToken: {
      orgUploadToken?: string | null
      error?: { __typename: string }
    }
  }

  function setup({ data = mockData }: { data?: SetupArgs } = {}) {
    server.use(
      graphql.mutation('regenerateOrgUploadToken', () => {
        return HttpResponse.json({ data })
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when calling the mutation', () => {
      describe('When mutation is a success', () => {
        it('returns isSuccess true', async () => {
          const { result } = renderHook(() => useRegenerateOrgUploadToken(), {
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
              regenerateOrgUploadToken: {
                error: { __typename: 'UnexpectedError' },
              },
            },
          })
        })
        it('throws a network error', async () => {
          const { result } = renderHook(() => useRegenerateOrgUploadToken(), {
            wrapper,
          })

          result.current.mutate()
          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          expect(mocks.rejectNetworkError).toHaveBeenCalledWith(
            expect.objectContaining({
              status: 404,
              dev: 'useRegenerateOrgUploadToken - 404 schema parsing failed',
              data: {},
            })
          )
        })
      })
    })
  })
})
