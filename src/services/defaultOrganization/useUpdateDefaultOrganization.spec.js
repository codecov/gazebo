import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateDefaultOrganization } from './useUpdateDefaultOrganization'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

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
  }

  describe('when called without an error', () => {
    beforeEach(() => {
      setup()
    })

    it('returns isLoading false', () => {
      const { result } = renderHook(() => useUpdateDefaultOrganization(), {
        wrapper,
      })
      expect(result.current.isLoading).toBeFalsy()
    })

    describe('When mutation is a success', () => {
      it('returns isSuccess true', async () => {
        const { result, waitFor } = renderHook(
          () => useUpdateDefaultOrganization(),
          {
            wrapper,
          }
        )
        result.current.mutate({ username: 'codecov' })
        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        expect(result.current.isSuccess).toBeTruthy()
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

    describe('When mutation is a success w/ a validation error', () => {
      it('returns isSuccess true', async () => {
        const { result, waitFor } = renderHook(
          () => useUpdateDefaultOrganization(),
          {
            wrapper,
          }
        )
        result.current.mutate({ username: 'random org!' })
        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)
        expect(result.current.error).toEqual(
          new Error(
            'Organization does not belong in the current users organization list'
          )
        )
      })
    })
  })
})
