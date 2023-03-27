import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import Cookie from 'js-cookie'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEraseAccount } from './useEraseAccount'

jest.mock('js-cookie')

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

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useEraseAccount', () => {
  function setup() {
    server.use(
      rest.delete(
        `/internal/${provider}/${owner}/account-details/`,
        (req, res, ctx) => {
          return res(ctx.status(204), null)
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('deletes the auth cookie', async () => {
      const { result, waitFor } = renderHook(
        () => useEraseAccount({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      result.current.mutate()

      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(Cookie.remove).toHaveBeenCalledWith('github-token')
      )
    })
  })
})
