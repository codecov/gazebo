import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOnboardUser } from './index'

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
  (initialEntries = '/gh') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useOnboardUser', () => {
  function setup() {
    server.use(
      graphql.mutation('OnboardUser', (req, res, ctx) => {
        const newUser = {
          ...user,
          onboardingCompleted: true,
        }
        return res(
          ctx.status(200),
          ctx.data({
            onboardUser: {
              me: newUser,
            },
          })
        )
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when calling the mutation', () => {
      it('returns success', async () => {
        const { result } = renderHook(() => useOnboardUser(), {
          wrapper: wrapper(),
        })

        result.current.mutate({})

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })

      it('updates the local cache', async () => {
        const { result } = renderHook(() => useOnboardUser(), {
          wrapper: wrapper(),
        })

        result.current.mutate({})

        await waitFor(() =>
          expect(queryClient.getQueryData(['currentUser', 'gh'])).toMatchObject(
            {
              ...user,
              onboardingCompleted: true,
            }
          )
        )
      })
    })
  })

  describe('when called with opts', () => {
    const onSuccessFn = jest.fn()
    beforeEach(() => {
      setup()
    })

    it('returns onSuccess from opts', async () => {
      const { result } = renderHook(
        () =>
          useOnboardUser({
            onSuccess: onSuccessFn,
          }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate({})

      await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      await waitFor(() => expect(onSuccessFn).toHaveBeenCalled())
    })
  })
})
