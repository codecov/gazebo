import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoSettings } from './useRepoSettings'

const queryClient = new QueryClient()

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useRepoSettings', () => {
  let hookData

  function setup(data) {
    server.use(
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )

    hookData = renderHook(() => useRepoSettings(), {
      wrapper,
    })
  }

  describe('when called with successful res', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            defaultBranch: 'master',
            private: true,
            uploadToken: 'token',
            profilingToken: 'token',
            graphToken: 'token',
          },
        },
      })
    })
    afterEach(() => server.resetHandlers())

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns the data', async () => {
        await hookData.waitFor(() =>
          expect(hookData.result.current.data).toEqual({
            repository: {
              defaultBranch: 'master',
              private: true,
              uploadToken: 'token',
              profilingToken: 'token',
              graphToken: 'token',
            },
          })
        )
      })
    })
  })

  describe('when called with unsuccessful res', () => {
    beforeEach(() => {
      setup({})
    })
    afterEach(() => server.resetHandlers())

    it('returns the data', async () => {
      await hookData.waitFor(() =>
        expect(hookData.result.current.data).toEqual({})
      )
    })
  })
})
