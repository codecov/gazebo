import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
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
      graphql.mutation('regenerateOrgUploadToken', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ data }))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      const { result } = renderHook(() => useRegenerateOrgUploadToken(), {
        wrapper,
      })
      expect(result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      it('returns isLoading true', async () => {
        const { result, waitFor } = renderHook(
          () => useRegenerateOrgUploadToken(),
          {
            wrapper,
          }
        )

        result.current.mutate()
        await waitFor(() => result.current.status !== 'idle')

        expect(result.current.isLoading).toBeTruthy()
      })
    })

    describe('When mutation is a success', () => {
      beforeEach(async () => {})

      it('returns isSuccess true', async () => {
        const { result, waitFor } = renderHook(
          () => useRegenerateOrgUploadToken(),
          {
            wrapper,
          }
        )

        result.current.mutate()
        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(result.current.isSuccess).toBeTruthy()
      })
    })
  })
})
