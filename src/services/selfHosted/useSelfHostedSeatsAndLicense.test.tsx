import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { useSelfHostedSeatsAndLicense } from './useSelfHostedSeatsAndLicense'

const mockSelfHostedLicense = {
  config: {
    seatsUsed: 5,
    seatsLimit: 30,
    selfHostedLicense: { expirationDate: '2020-05-09T00:00:00' },
  },
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

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

interface SetupArgs {
  isUnsuccessfulParseError?: boolean
}

describe('useSelfHostedSeatsAndLicense', () => {
  function setup({ isUnsuccessfulParseError = false }: SetupArgs) {
    server.use(
      graphql.query('SelfHostedSeatsAndLicense', () => {
        if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockUnsuccessfulParseError })
        } else {
          return HttpResponse.json({ data: mockSelfHostedLicense })
        }
      })
    )
  }

  describe('when useSelfHostedSeatsAndLicense is called', () => {
    describe('api returns valid response', () => {
      describe('license information is resolved', () => {
        it('returns the license details', async () => {
          setup({})
          const { result } = renderHook(
            () => useSelfHostedSeatsAndLicense({ provider: 'gh' }),
            { wrapper }
          )

          await waitFor(() =>
            expect(result.current.data).toEqual({
              seatsUsed: 5,
              seatsLimit: 30,
              selfHostedLicense: {
                expirationDate: '2020-05-09T00:00:00',
              },
            })
          )
        })
      })
    })

    describe('unsuccessful parse of zod schema', () => {
      let consoleSpy: MockInstance
      beforeAll(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () => useSelfHostedSeatsAndLicense({ provider: 'gh' }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({ status: 404 })
          )
        )
      })
    })
  })
})
