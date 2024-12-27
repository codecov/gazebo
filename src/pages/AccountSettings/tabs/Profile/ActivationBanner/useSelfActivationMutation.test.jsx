import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { SelfHostedSeatsConfigQueryOpts } from 'services/selfHosted/SelfHostedSeatsConfigQueryOpts'

import { useSelfActivationMutation } from './useSelfActivationMutation'

const queryClient = new QueryClient({
  logger: { error: () => {} },
  defaultOptions: { retry: false },
})

const queryClientV5 = new QueryClientV5({
  logger: { error: () => {} },
  defaultOptions: { retry: false },
})

const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useSelfActivationMutation', () => {
  describe('on a successful call', () => {
    describe('user can activate themselves', () => {
      beforeEach(() => {
        queryClientV5.setQueryData(
          SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey,
          { data: { config: { seatsUsed: 0, seatsLimit: 10 } } }
        )

        queryClient.setQueryData(['SelfHostedCurrentUser'], {
          activated: false,
        })

        const mockUser = {
          activated: false,
        }

        server.use(
          http.get('/internal/users/current', () => {
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
          expect(
            queryClientV5.getQueryData(
              SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey
            )
          ).toStrictEqual({
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
        queryClientV5.setQueryData(
          SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey,
          { data: { config: { seatsUsed: 1, seatsLimit: 10 } } }
        )

        queryClient.setQueryData(['SelfHostedCurrentUser'], {
          activated: true,
        })

        const mockUser = {
          activated: true,
        }

        server.use(
          http.get('/internal/users/current', () => {
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
          expect(
            queryClientV5.getQueryData(
              SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey
            )
          ).toStrictEqual({
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
        queryClientV5.setQueryData(
          SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey,
          { data: { config: { seatsUsed: 10, seatsLimit: 10 } } }
        )

        queryClient.setQueryData(['SelfHostedCurrentUser'], {
          activated: false,
        })

        const mockUser = {
          activated: false,
        }

        server.use(
          http.get('/internal/users/current', () => {
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
          expect(
            queryClientV5.getQueryData(
              SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey
            )
          ).toStrictEqual({
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
      queryClientV5.setQueryData(
        SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey,
        { data: { config: { seatsUsed: 1, seatsLimit: 10 } } }
      )

      queryClient.setQueryData(['SelfHostedCurrentUser'], {
        activated: true,
      })

      const mockUser = {
        activated: true,
      }

      server.use(
        http.get('/internal/users/current', () => {
          return HttpResponse.json(mockUser)
        }),
        http.patch('/internal/users/current', () => {
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
        expect(
          queryClientV5.getQueryData(
            SelfHostedSeatsConfigQueryOpts({ provider: 'gh' }).queryKey
          )
        ).toStrictEqual({
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
