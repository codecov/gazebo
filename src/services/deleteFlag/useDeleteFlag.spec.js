import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useDeleteFlag } from './useDeleteFlag'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => server.close())

const queryClient = new QueryClient()

const ownerUsername = 'vox-machina'
const repoName = 'vestiges'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh/${ownerUsername}/${repoName}/flags`]}>
    <Route path="/:provider/:owner/:repo/flags">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useDeleteFlag', () => {
  function setup(data = {}, triggerError = false) {
    server.use(
      graphql.mutation('deleteFlag', (req, res, ctx) => {
        if (triggerError) {
          return res(ctx.status(200), ctx.data(data))
        } else {
          return res(ctx.status(200), ctx.data(data))
        }
      })
    )
  }

  describe('when called without an error', () => {
    beforeEach(() => {
      setup({ deleteFlag: { ownerUsername, repoName, flagName: 'flag-123' } })
    })

    it('returns isLoading false', () => {
      const { result } = renderHook(() => useDeleteFlag(), {
        wrapper,
      })
      expect(result.current.isLoading).toBeFalsy()
    })

    describe('When mutation is a success', () => {
      it('returns successful response', async () => {
        const { result, waitFor } = renderHook(() => useDeleteFlag(), {
          wrapper,
        })
        result.current.mutate({ flagName: 'flag-123' })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })

  describe('when called with a validation error', () => {
    const mockData = {
      deleteFlag: {
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
        const { result, waitFor } = renderHook(() => useDeleteFlag(), {
          wrapper,
        })
        result.current.mutate({ flagName: 'random-flag-123' })

        await waitFor(() =>
          expect(result.current.error).toEqual(
            new Error('There was an error deleting your flag')
          )
        )
      })
    })
  })
})
