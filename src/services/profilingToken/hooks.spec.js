import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { act } from 'react-test-renderer'

import { useRegenerateProfilingToken } from './hooks'

const data = {
  data: {
    regenerateProfilingToken: {
      profilingToken: 'new token',
    },
  },
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

describe('useRegenerateProfilingToken', () => {
  let hookData

  function setup({ provider }) {
    server.use(
      rest.patch('/graphql/gh/', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(data))
      })
    )
    hookData = renderHook(() => useRegenerateProfilingToken({ provider }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({ provider: 'gh' })
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        hookData.result.current.mutate({ owner: 'rula', repoName: 'test' })
        return hookData.waitFor(() => hookData.result.current.status !== 'idle')
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })

    describe('When success', () => {
      beforeEach(async () => {
        return act(async () => {
          hookData.result.current.mutate({ owner: 'rula', repoName: 'test' })
          await hookData.waitFor(() => hookData.result.current.isLoading)
          await hookData.waitFor(() => !hookData.result.current.isLoading)
        })
      })

      it('returns isSuccess true', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })
    })
  })
})
