import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useSelfActivationMutation } from './useSelfActivationMutation'

const queryClient = new QueryClient({
  logger: {
    error: () => {},
  },
  defaultOptions: {
    retry: false,
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route>{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('useSelfActivationMutation', () => {
  describe('on a successful call', () => {
    describe('user can activate themselves', () => {
      beforeEach(() => {
        queryClient.setQueryData(['Seats'], {
          data: {
            config: {
              seatsUsed: 0,
              seatsLimit: 10,
            },
          },
        })

        queryClient.setQueryData(['SelfHostedCurrentUser'], {
          activated: false,
        })

        const mockUser = {
          activated: false,
        }

        server.use(
          rest.get('/internal/users/current', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockUser))
          }),
          rest.patch('/internal/users/current', (req, res, ctx) => {
            const { activated } = req.body

            mockUser.activated = activated

            return res(ctx.status(200), ctx.json({}))
          })
        )
      })

      it('updates query data', async () => {
        const { result, waitFor } = renderHook(
          () => useSelfActivationMutation({ queryClient, canChange: true }),
          { wrapper }
        )

        const { mutate } = result.current
        mutate(true)

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
          data: { config: { seatsUsed: 1, seatsLimit: 10 } },
        })
        expect(
          queryClient.getQueryData(['SelfHostedCurrentUser'])
        ).toStrictEqual({ activated: true })
      })
    })

    describe('user can deactivate themselves', () => {
      beforeEach(() => {
        queryClient.setQueryData(['Seats'], {
          data: {
            config: {
              seatsUsed: 1,
              seatsLimit: 10,
            },
          },
        })

        queryClient.setQueryData(['SelfHostedCurrentUser'], {
          activated: true,
        })

        const mockUser = {
          activated: true,
        }

        server.use(
          rest.get('/internal/users/current', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockUser))
          }),
          rest.patch('/internal/users/current', (req, res, ctx) => {
            const { activated } = req.body

            mockUser.activated = activated

            return res(ctx.status(200), ctx.json({}))
          })
        )
      })

      it('updates query data', async () => {
        const { result, waitFor } = renderHook(
          () => useSelfActivationMutation({ queryClient, canChange: true }),
          { wrapper }
        )

        const { mutate } = result.current
        mutate(false)

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
          data: { config: { seatsUsed: 0, seatsLimit: 10 } },
        })
        expect(
          queryClient.getQueryData(['SelfHostedCurrentUser'])
        ).toStrictEqual({ activated: false })
      })
    })

    describe('user cannot change their status', () => {
      beforeEach(() => {
        queryClient.setQueryData(['Seats'], {
          data: {
            config: {
              seatsUsed: 10,
              seatsLimit: 10,
            },
          },
        })

        queryClient.setQueryData(['SelfHostedCurrentUser'], {
          activated: false,
        })

        const mockUser = {
          activated: false,
        }

        server.use(
          rest.get('/internal/users/current', (req, res, ctx) => {
            return res(ctx.status(200), ctx.json(mockUser))
          }),
          rest.patch('/internal/users/current', (req, res, ctx) => {
            const { activated } = req.body

            mockUser.activated = activated

            return res(ctx.status(200), ctx.json({}))
          })
        )
      })
      it('does not change the query data', async () => {
        const { result, waitFor } = renderHook(
          () => useSelfActivationMutation({ queryClient, canChange: false }),
          { wrapper }
        )

        const { mutate } = result.current

        act(() => mutate(false))

        await waitFor(() => result.current.isSuccess)

        expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
          data: { config: { seatsUsed: 10, seatsLimit: 10 } },
        })
        expect(
          queryClient.getQueryData(['SelfHostedCurrentUser'])
        ).toStrictEqual({ activated: false })
      })
    })
  })

  describe('on an unsuccessful call', () => {
    beforeEach(() => {
      queryClient.setQueryData(['Seats'], {
        data: {
          config: {
            seatsUsed: 1,
            seatsLimit: 10,
          },
        },
      })

      queryClient.setQueryData(['SelfHostedCurrentUser'], {
        activated: true,
      })

      const mockUser = {
        activated: true,
      }

      server.use(
        rest.get('/internal/users/current', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockUser))
        }),
        rest.patch('/internal/users/current', (req, res, ctx) => {
          return res(ctx.status(400), ctx.json({}))
        })
      )
    })
    it('reverts to old query data', async () => {
      const { result, waitFor } = renderHook(
        () => useSelfActivationMutation({ queryClient, canChange: true }),
        { wrapper }
      )

      const { mutate } = result.current
      mutate(true)

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
        data: { config: { seatsUsed: 1, seatsLimit: 10 } },
      })
      expect(queryClient.getQueryData(['SelfHostedCurrentUser'])).toStrictEqual(
        { activated: true }
      )
    })
  })
})
