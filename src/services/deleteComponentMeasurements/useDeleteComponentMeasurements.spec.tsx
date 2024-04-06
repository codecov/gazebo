import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import { useDeleteComponentMeasurements } from './useDeleteComponentMeasurements'

jest.mock('services/toastNotification')

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const ownerUsername = 'codecov'
const repoName = 'gazebo'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter
    initialEntries={[`/gh/${ownerUsername}/${repoName}/components`]}
  >
    <Route path="/:provider/:owner/:repo/components">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useDeleteComponentMeasurements', () => {
  function setup(data = {}, triggerError = false) {
    const mutate = jest.fn()
    server.use(
      graphql.mutation('deleteComponentMeasurements', (req, res, ctx) => {
        mutate(req.variables)
        if (triggerError) {
          return res(ctx.status(500), ctx.data(data))
        } else {
          return res(ctx.status(200), ctx.data(data))
        }
      })
    )

    const addNotification = jest.fn()

    //@ts-ignore
    useAddNotification.mockReturnValue(addNotification)

    return { addNotification, mutate }
  }

  describe('when called without an error', () => {
    describe('When mutation is a success', () => {
      it('returns successful response', async () => {
        const { mutate } = setup({
          deleteComponentMeasurements: {
            ownerUsername,
            repoName,
            componentId: 'component-123',
          },
        })
        const { result } = renderHook(() => useDeleteComponentMeasurements(), {
          wrapper,
        })
        result.current.mutate({ componentId: 'component-123' })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
        await waitFor(() =>
          expect(mutate).toHaveBeenCalledWith({
            input: {
              componentId: 'component-123',
              ownerUsername: 'codecov',
              repoName: 'gazebo',
            },
          })
        )
      })
    })
  })

  describe('when called with a validation error', () => {
    describe('When mutation is a success w/ a validation error', () => {
      it('adds an error notification', async () => {
        const mockData = {
          deleteComponentMeasurements: {
            error: {
              __typename: 'ValidationError',
            },
          },
        }
        const { addNotification } = setup(mockData)
        const { result } = renderHook(() => useDeleteComponentMeasurements(), {
          wrapper,
        })
        result.current.mutate({ componentId: 'random-component-123' })

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'There was an error deleting your component measurements',
          })
        )
      })
    })

    describe('When mutation is not successful', () => {
      it('adds an error notification', async () => {
        const mockData = {
          deleteComponentMeasurements: {
            error: {
              __typename: 'ValidationError',
            },
          },
        }
        const triggerError = true
        const { addNotification } = setup(mockData, triggerError)
        const { result } = renderHook(() => useDeleteComponentMeasurements(), {
          wrapper,
        })
        result.current.mutate({ componentId: 'random-component-123' })

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'There was an error deleting your component measurements',
          })
        )
      })
    })
  })
})
