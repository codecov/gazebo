import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useUpdateProfile } from './useUpdateProfile'

vi.mock('config')

const user = {
  username: 'TerrySmithDC',
  email: 'terry@terry.com',
  name: 'terry',
  avatarUrl: 'http://127.0.0.1/avatar-url',
  onboardingCompleted: false,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()
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

describe('useUpdateProfile', () => {
  function setup() {
    server.use(
      graphql.mutation('UpdateProfile', (info) => {
        const newUser = {
          email: info.variables.input.email,
          onboardingCompleted: user.onboardingCompleted,
          user: {
            name: info.variables.input.name,
            username: user.username,
            avatarUrl: user.avatarUrl,
          },
        }

        return HttpResponse.json({
          data: {
            updateProfile: {
              me: newUser,
            },
          },
        })
      })
    )
  }

  describe('when running in self-hosted', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
    })

    describe('when calling the mutation', () => {
      const newData = {
        email: 'newemail@test.com',
        name: 'new name',
      }

      it('returns success', async () => {
        setup()
        const { result } = renderHook(
          () => useUpdateProfile({ provider: 'gh' }),
          { wrapper: wrapper() }
        )

        result.current.mutate(newData)

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            email: 'newemail@test.com',
            onboardingCompleted: false,
            user: {
              avatarUrl: 'http://127.0.0.1/avatar-url',
              name: 'new name',
              username: 'TerrySmithDC',
            },
          })
        )
      })

      it('returns new user', async () => {
        setup()
        const { result } = renderHook(
          () => useUpdateProfile({ provider: 'gh' }),
          { wrapper: wrapper() }
        )

        result.current.mutate(newData)

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            email: 'newemail@test.com',
            onboardingCompleted: false,
            user: {
              avatarUrl: 'http://127.0.0.1/avatar-url',
              name: 'new name',
              username: 'TerrySmithDC',
            },
          })
        )
      })
    })
  })

  describe('when not running in self-hosted', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = false
    })

    describe('when calling the mutation', () => {
      const newData = {
        email: 'newemail@test.com',
        name: 'new name',
      }

      it('returns success', async () => {
        setup()
        const { result } = renderHook(
          () => useUpdateProfile({ provider: 'gh' }),
          { wrapper: wrapper() }
        )

        result.current.mutate(newData)

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })

      it('returns new user', async () => {
        setup()
        const { result } = renderHook(
          () => useUpdateProfile({ provider: 'gh' }),
          { wrapper: wrapper() }
        )

        result.current.mutate(newData)

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            email: 'newemail@test.com',
            onboardingCompleted: false,
            user: {
              avatarUrl: 'http://127.0.0.1/avatar-url',
              name: 'new name',
              username: 'TerrySmithDC',
            },
          })
        )
      })
    })
  })
})
