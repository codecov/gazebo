import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useInvoices } from './useInvoices'

jest.mock('@stripe/react-stripe-js')
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
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useInvoices', () => {
  const invoices = [
    { total: 2400, number: 1, created: 1607078662, dueDate: 1607078662 },
    { total: 2500, number: 2, created: 1604486662, dueDate: 1604486662 },
  ]

  function setup() {
    server.use(
      rest.get(`/internal/${provider}/${owner}/invoices/`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(invoices))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns the data', async () => {
      const { result, waitFor } = renderHook(
        () => useInvoices({ provider, owner }),
        {
          wrapper: wrapper(),
        }
      )

      await waitFor(() => expect(result.current.data).toEqual(invoices))
    })
  })
})
