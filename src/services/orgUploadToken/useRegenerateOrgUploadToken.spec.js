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
  let hookData

  function setup() {
    server.use(
      graphql.mutation('regenerateOrgUploadToken', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ data }))
      })
    )
    hookData = renderHook(() => useRegenerateOrgUploadToken(), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        hookData.result.current.mutate()
        return hookData.waitFor(() => hookData.result.current.status !== 'idle')
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })

    describe('When mutation is a success', () => {
      beforeEach(async () => {
        hookData.result.current.mutate()
        await hookData.waitFor(() => hookData.result.current.isLoading)
        await hookData.waitFor(() => !hookData.result.current.isLoading)
      })

      it('returns isSuccess true', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })
    })
  })
})
