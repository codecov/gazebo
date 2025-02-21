import { QueryClient, QueryClientProvider } from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import {
  UnverifiedPaymentMethodSchema,
  useUnverifiedPaymentMethods,
} from './useUnverifiedPaymentMethods'

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
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useUnverifiedPaymentMethods', () => {
  function setup(
    unverifiedPaymentMethods: z.infer<typeof UnverifiedPaymentMethodSchema>[]
  ) {
    server.use(
      graphql.query('UnverifiedPaymentMethods', () => {
        return HttpResponse.json({
          data: {
            owner: {
              billing: {
                unverifiedPaymentMethods,
              },
            },
          },
        })
      })
    )
  }

  describe('when called', () => {
    describe('on success', () => {
      it('returns empty array when no unverified payment methods exist', async () => {
        setup([])
        const { result } = renderHook(
          () => useUnverifiedPaymentMethods({ provider, owner }),
          { wrapper: wrapper() }
        )

        await waitFor(() => expect(result.current.data).toEqual([]))
      })

      it('returns array of unverified payment methods', async () => {
        const unverifiedPaymentMethods = [
          {
            paymentMethodId: 'pm_123',
            hostedVerificationUrl: 'https://example.com/verify',
          },
        ]
        setup(unverifiedPaymentMethods)

        const { result } = renderHook(
          () => useUnverifiedPaymentMethods({ provider, owner }),
          { wrapper: wrapper() }
        )

        await waitFor(() =>
          expect(result.current.data).toEqual([
            {
              paymentMethodId: 'pm_123',
              hostedVerificationUrl: 'https://example.com/verify',
            },
          ])
        )
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
        setup([
          {
            // @ts-expect-error - force fail with wrong key
            wrongKey: 'wrongData',
          },
        ])

        const { result } = renderHook(
          () => useUnverifiedPaymentMethods({ provider, owner }),
          { wrapper: wrapper() }
        )

        await waitFor(() => expect(result.current.error).toBeTruthy())
        expect(result.current.error).toEqual(
          expect.objectContaining({
            dev: 'useUnverifiedPaymentMethods - Parsing Error',
            status: 400,
          })
        )
      })
    })
  })
})
