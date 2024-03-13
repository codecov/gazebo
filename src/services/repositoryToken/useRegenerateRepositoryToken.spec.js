import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import { useRegenerateRepositoryToken } from './useRegenerateRepositoryToken'

jest.mock('services/toastNotification')

const data = {
  data: {
    regenerateRepositoryToken: {
      error: {
        __typename: 'Error',
      },
      token: 'new token',
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRegenerateRepositoryToken', () => {
  function setup({ triggerError = false } = { triggerError: false }) {
    const addNotification = jest.fn()

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      graphql.mutation('RegenerateRepositoryToken', (req, res, ctx) => {
        if (triggerError) {
          return res(ctx.status(500), ctx.data({ data: null }))
        }
        return res(ctx.status(200), ctx.data({ data }))
      })
    )

    return { addNotification }
  }

  describe('when called', () => {
    describe('When mutation is a success', () => {
      it('returns isSuccess true', async () => {
        setup()
        const { result } = renderHook(
          () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
          {
            wrapper,
          }
        )

        result.current.mutate()

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })

  describe('when mutations has an error type', () => {
    it('fires toast message', async () => {
      const { addNotification } = setup()
      const { result } = renderHook(
        () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
        {
          wrapper,
        }
      )

      result.current.mutate()

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Error',
        })
      )
    })
  })

  describe('when mutation has a network error', () => {
    beforeEach(() => {
      // silence console errors for failed requests
      console.error = () => {}
    })

    it('adds an error notification', async () => {
      const { addNotification } = setup({ triggerError: true })
      const { result } = renderHook(
        () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
        {
          wrapper,
        }
      )

      result.current.mutate()

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
        })
      )
    })
  })
})
