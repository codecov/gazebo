import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { invoiceObject } from './mocks'
import { useInvoices } from './useInvoices'

vi.mock('@stripe/react-stripe-js')
vi.mock('js-cookie')

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
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('useInvoices', () => {
  const invoices = [invoiceObject, invoiceObject, invoiceObject, invoiceObject]

  function setup(hasError = false) {
    server.use(
      graphql.query('Invoices', (info) => {
        if (hasError) {
          return HttpResponse.json({ data: {} })
        }

        return HttpResponse.json({
          data: { owner: { invoices: [...invoices] } },
        })
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
      beforeAll(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        vi.restoreAllMocks()
      })

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
