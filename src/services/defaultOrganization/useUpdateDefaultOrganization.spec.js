import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateDefaultOrganization } from './useUpdateDefaultOrganization'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner/">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useUpdateDefaultOrganization', () => {
  let hookData

  function setup(data = {}, triggerError = false) {
    server.use(
      graphql.mutation('updateDefaultOrganization', (req, res, ctx) => {
        if (triggerError) {
          return res(ctx.status(200), ctx.data(data))
        } else {
          return res(ctx.status(200), ctx.data({}))
        }
      })
    )
    hookData = renderHook(() => useUpdateDefaultOrganization(), {
      wrapper,
    })
  }

  describe('when called without an error', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      beforeEach(() => {
        hookData.result.current.mutate({ username: 'codecov' })
        return hookData.waitFor(() => hookData.result.current.status !== 'idle')
      })

      it('returns isLoading true', () => {
        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })

    describe('When mutation is a success', () => {
      beforeEach(async () => {
        hookData.result.current.mutate({ username: 'codecov' })
        await hookData.waitFor(() => hookData.result.current.isLoading)
        await hookData.waitFor(() => !hookData.result.current.isLoading)
      })

      it('returns isSuccess true', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })
    })
  })

  describe('when called with a validation error', () => {
    const mockData = {
      updateDefaultOrganization: {
        error: {
          __typename: 'ValidationError',
        },
      },
    }
    beforeEach(() => {
      const triggerError = true
      setup(mockData, triggerError)
    })

    it('returns isLoading false', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('When mutation is a success w/ a validation error', () => {
      beforeEach(async () => {
        hookData.result.current.mutate({ username: 'random org!' })
        await hookData.waitFor(() => hookData.result.current.isLoading)
        await hookData.waitFor(() => !hookData.result.current.isLoading)
      })

      it('returns isSuccess true', () => {
        expect(hookData.result.current.error).toEqual(
          new Error(
            'Organization does not belong in the current users organization list'
          )
        )
      })
    })
  })
})
