import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
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

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
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
          http.get('/internal/users/current', (info) => {
            return HttpResponse.json(mockUser)
          }),
          http.patch('/internal/users/current', async (info) => {
            const { activated } = await info.request.json()

            mockUser.activated = activated

            return HttpResponse.json({})
          })
        )
      })

      it('updates query data', async () => {
        const { result } = renderHook(
          () => useSelfActivationMutation({ queryClient, canChange: true }),
          { wrapper: wrapper() }
        )

        act(() => result.current.mutate(true))

        await waitFor(() =>
          expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
            data: { config: { seatsUsed: 1, seatsLimit: 10 } },
          })
        )

        await waitFor(() =>
          expect(
            queryClient.getQueryData(['SelfHostedCurrentUser'])
          ).toStrictEqual({ activated: true })
        )
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
          http.get('/internal/users/current', (info) => {
            return HttpResponse.json(mockUser)
          }),
          http.patch('/internal/users/current', async (info) => {
            const { activated } = await info.request.json()

            mockUser.activated = activated
            return HttpResponse.json({})
          })
        )
      })

      it('updates query data', async () => {
        const { result } = renderHook(
          () => useSelfActivationMutation({ queryClient, canChange: true }),
          { wrapper: wrapper() }
        )

        act(() => result.current.mutate(false))

        await waitFor(() =>
          expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
            data: { config: { seatsUsed: 0, seatsLimit: 10 } },
          })
        )

        await waitFor(() =>
          expect(
            queryClient.getQueryData(['SelfHostedCurrentUser'])
          ).toStrictEqual({ activated: false })
        )
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
          http.get('/internal/users/current', (info) => {
            return HttpResponse.json(mockUser)
          }),
          http.patch('/internal/users/current', async (info) => {
            const { activated } = await info.request.json()

            mockUser.activated = activated

            return HttpResponse.json({})
          })
        )
      })

      it('does not change the query data', async () => {
        const { result } = renderHook(
          () => useSelfActivationMutation({ queryClient, canChange: false }),
          { wrapper: wrapper() }
        )

        act(() => result.current.mutate(false))

        await waitFor(() =>
          expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
            data: { config: { seatsUsed: 10, seatsLimit: 10 } },
          })
        )

        await waitFor(() =>
          expect(
            queryClient.getQueryData(['SelfHostedCurrentUser'])
          ).toStrictEqual({ activated: false })
        )
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
        http.get('/internal/users/current', (req, res, ctx) => {
          return HttpResponse.json(mockUser)
        }),
        http.patch('/internal/users/current', (req, res, ctx) => {
          return HttpResponse.json({}, { status: 400 })
        })
      )
    })

    it('reverts to old query data', async () => {
      const { result } = renderHook(
        () => useSelfActivationMutation({ queryClient, canChange: true }),
        { wrapper: wrapper() }
      )

      act(() => result.current.mutate(false))

      await waitFor(() =>
        expect(queryClient.getQueryData(['Seats'])).toStrictEqual({
          data: { config: { seatsUsed: 1, seatsLimit: 10 } },
        })
      )

      await waitFor(() => result.current.isError)
      await waitFor(() =>
        expect(
          queryClient.getQueryData(['SelfHostedCurrentUser'])
        ).toStrictEqual({ activated: true })
      )
    })
  })
})
