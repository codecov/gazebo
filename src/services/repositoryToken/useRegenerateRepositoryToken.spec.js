import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
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
  function setup() {
    const addNotification = jest.fn()
    let hookData

    useAddNotification.mockReturnValue(addNotification)

    server.use(
      graphql.mutation('RegenerateRepositoryToken', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ data }))
      })
    )
    hookData = renderHook(
      () => useRegenerateRepositoryToken({ tokenType: 'profiling' }),
      {
        wrapper,
      }
    )
    return { addNotification, hookData }
  }

  describe('when called', () => {
    it('returns isLoading false', () => {
      const { hookData } = setup()

      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      it('returns isLoading true', async () => {
        const { hookData } = setup()

        hookData.result.current.mutate()
        await hookData.waitFor(() => hookData.result.current.status !== 'idle')

        expect(hookData.result.current.isLoading).toBeTruthy()
      })
    })

    describe('When mutation is a success', () => {
      it('returns isSuccess true', async () => {
        const { hookData } = setup()

        hookData.result.current.mutate()
        await hookData.waitFor(() => hookData.result.current.isLoading)
        await hookData.waitFor(() => !hookData.result.current.isLoading)

        expect(hookData.result.current.isSuccess).toBeTruthy()
      })
    })
  })

  describe('mutations has an error type', () => {
    it('fires toast message', async () => {
      const { addNotification, hookData } = setup()

      hookData.result.current.mutate()
      await hookData.waitFor(() => hookData.result.current.isLoading)
      await hookData.waitFor(() => !hookData.result.current.isLoading)

      await waitFor(() => expect(addNotification).toBeCalled())
    })
  })
})
