import { renderHook, act } from '@testing-library/react-hooks'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'
import { graphql } from 'msw'
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
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRegenerateProfilingToken', () => {
  let hookData


  function setup() {
    server.use(
      graphql.mutation('regenerateProfilingToken', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({ data })
        )
      })
    )
    hookData = renderHook(() => useRegenerateProfilingToken(), {
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
        return act(async () => {
          hookData.result.current.mutate()
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
