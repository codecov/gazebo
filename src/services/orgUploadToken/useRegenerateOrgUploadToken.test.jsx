import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateOrgUploadToken } from './useRegenerateOrgUploadToken'

const data = {
  data: {
    regenerateOrgUploadToken: {
      orgUploadToken: 'new token',
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRegenerateOrgUploadToken', () => {
  function setup() {
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
    })
  })
})
