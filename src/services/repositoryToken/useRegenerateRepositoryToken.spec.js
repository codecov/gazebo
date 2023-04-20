import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
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
    it('returns isLoading false', () => {
      setup()
      const { result } = renderHook(
        () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
        {
          wrapper,
        }
      )

      expect(result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      it('returns isLoading true', async () => {
        setup()
        const { result, waitFor } = renderHook(
          () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
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
      it('returns isSuccess true', async () => {
        setup()
        const { result, waitFor } = renderHook(
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
      const { result, waitFor } = renderHook(
        () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
        {
          wrapper,
        }
      )

      result.current.mutate()

      await waitFor(() =>
        expect(addNotification).toBeCalledWith({
          type: 'error',
          text: 'Error',
        })
      )
    })
  })

  describe('when mutation has a network error', () => {
    it('adds an error notification', async () => {
      const { addNotification } = setup({ triggerError: true })
      const { result, waitFor } = renderHook(
        () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
        {
          wrapper,
        }
      )

      result.current.mutate()

      await waitFor(() =>
        expect(addNotification).toBeCalledWith({
          type: 'error',
        })
      )
    })
  })
})
