import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateOrgUploadToken } from './useRegenerateOrgUploadToken'

const mocks = vi.hoisted(() => ({
  useRedirect: vi.fn(),
  renderToast: vi.fn(),
}))

vi.mock('services/toast', async () => {
  const actual = await vi.importActual('services/toast')
  return {
    ...actual,
    renderToast: mocks.renderToast,
  }
})

const mockData = {
  regenerateOrgUploadToken: {
    orgUploadToken: 'new token',
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
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

        it('displays error toast when there is an error', async () => {
          setup({
            data: {
              regenerateOrgUploadToken: {
                error: { __typename: 'ValidationError' },
                orgUploadToken: null,
              },
            },
          })

          const { result } = renderHook(() => useRegenerateOrgUploadToken(), {
            wrapper,
          })

          result.current.mutate()
          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() =>
            expect(mocks.renderToast).toHaveBeenCalledWith({
              type: 'error',
              title: 'Error generating upload token',
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
