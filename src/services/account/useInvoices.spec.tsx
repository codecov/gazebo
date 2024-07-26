import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { invoiceObject } from './mocks'
import { useInvoices } from './useInvoices'

jest.mock('@stripe/react-stripe-js')
jest.mock('js-cookie')

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

const provider = 'gh'
const owner = 'codecov'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useInvoices', () => {
  const invoices = [invoiceObject, invoiceObject, invoiceObject, invoiceObject]

  function setup(hasError = false) {
    server.use(
      graphql.query('Invoices', (req, res, ctx) => {
        if (hasError) {
          return res(ctx.status(200), ctx.data({}))
        }

        return res(
          ctx.status(200),
          ctx.data({ owner: { invoices: [...invoices] } })
        )
      })
    )
  }

  describe('when called', () => {
    describe('on success', () => {
      it('returns the data', async () => {
        setup()
        const { result } = renderHook(() => useInvoices({ provider, owner }), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.data).toEqual(invoices))
      })
    })

    describe('on fail', () => {
      it('fails to parse if bad data', async () => {
        setup(true)
        const { result } = renderHook(() => useInvoices({ provider, owner }), {
          wrapper: wrapper(),
        })

        await waitFor(() => expect(result.current.error).toBeTruthy())
      })
    })
  })
})
