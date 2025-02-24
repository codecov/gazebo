import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import { accountDetailsParsedObj } from './mocks'
import { AccountDetailsSchema, useAccountDetails } from './useAccountDetails'

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
  // We still want to test our zod schema for any changes against the mocks
  process.env.REACT_APP_ZOD_IGNORE_TESTS = 'false'
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  process.env.REACT_APP_ZOD_IGNORE_TESTS = 'true'
  server.close()
})

describe('useAccountDetails', () => {
  function setup(accountDetails: z.infer<typeof AccountDetailsSchema>) {
    server.use(
      http.get(`/internal/${provider}/${owner}/account-details/`, () => {
        return HttpResponse.json(accountDetails)
      })
    )
  }

  describe('when called', () => {
    it('returns the data', async () => {
      setup(accountDetailsParsedObj)
      const { result } = renderHook(
        () => useAccountDetails({ provider, owner }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual(accountDetailsParsedObj)
      )
    })

    it('returns data with usBankAccount when enabled', async () => {
      const withUSBankAccount = {
        ...accountDetailsParsedObj,
        subscriptionDetail: {
          ...accountDetailsParsedObj.subscriptionDetail,
          defaultPaymentMethod: {
            billingDetails: null,
            usBankAccount: {
              bankName: 'Bank of America',
              last4: '1234',
            },
          },
        },
      }
      setup(withUSBankAccount)

      const { result } = renderHook(
        () => useAccountDetails({ provider, owner }),
        { wrapper: wrapper() }
      )

      await waitFor(() =>
        expect(result.current.data).toEqual({
          ...accountDetailsParsedObj,
          subscriptionDetail: {
            ...accountDetailsParsedObj.subscriptionDetail,
            defaultPaymentMethod: {
              billingDetails: null,
              usBankAccount: {
                bankName: 'Bank of America',
                last4: '1234',
              },
            },
          },
        })
      )
    })
  })

  describe('when the data is not valid', () => {
    it('throws a 400', async () => {
      // @ts-expect-error - testing parsing error
      setup({ badData: true })

      const { result } = renderHook(
        () => useAccountDetails({ provider, owner }),
        { wrapper: wrapper() }
      )

      await waitFor(() => expect(result.current.isError).toBeTruthy())
      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useAccountDetails - Parsing Error',
            status: 400,
          })
        )
      )
    })
  })
})
