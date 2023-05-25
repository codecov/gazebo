import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useInvoice } from './useInvoice'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
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
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useInvoice', () => {
  const id = 'in_1234567'
  const invoice = {
    total: 2400,
    number: 1,
    created: 1607078662,
    dueDate: 1607078662,
  }

  function setup() {
    server.use(
      rest.get(
        `/internal/${provider}/${owner}/invoices/${id}`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(invoice))
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the data', async () => {
      const { result } = renderHook(() => useInvoice({ provider, owner, id }), {
        wrapper: wrapper(),
      })

      await waitFor(() => expect(result.current.data).toEqual(invoice))
    })
  })
})
