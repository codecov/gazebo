import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAutoActivate } from './useAutoActivate'

const server = setupServer()
const queryClient = new QueryClient()
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

const provider = 'gh'
const owner = 'codecov'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useAutoActivate', () => {
  let onSuccess = jest.fn()
  const opts = {
    onSuccess,
  }

  describe('options is set', () => {
    function setup() {
      server.use(
        rest.patch(
          `/internal/${provider}/${owner}/account-details/`,
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}))
          }
        )
      )
    }

    describe('when called', () => {
      beforeEach(() => {
        setup()
      })

      it('opts are passed through to react-query', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
              opts,
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate(true)

        await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
      })

      it('accountDetails cache unchanged', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
              opts,
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate(true)

        await waitFor(() =>
          expect(queryClient.isFetching(['accountDetails'])).toBe(0)
        )
      })

      it('users cache unchanged', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
              opts,
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate(true)

        await waitFor(() => expect(queryClient.isFetching(['users'])).toBe(0))
      })
    })
  })

  describe('opts is not set', () => {
    function setup() {
      server.use(
        rest.patch(
          `/internal/${provider}/${owner}/account-details/`,
          (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}))
          }
        )
      )
    }

    describe('when called', () => {
      beforeEach(() => {
        setup()
      })

      it('accountDetails cache unchanged', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate(true)

        await waitFor(() =>
          expect(queryClient.isFetching(['accountDetails'])).toBe(0)
        )
      })

      it('users cache unchanged', async () => {
        const { result, waitFor } = renderHook(
          () =>
            useAutoActivate({
              provider,
              owner,
            }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate(true)

        await waitFor(() => expect(queryClient.isFetching(['users'])).toBe(0))
      })
    })
  })
})
