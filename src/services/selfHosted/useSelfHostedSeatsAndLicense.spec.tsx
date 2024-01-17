import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import type { ReactNode } from 'react'

import { useSelfHostedSeatsAndLicense } from './useSelfHostedSeatsAndLicense'

const mockSelfHostedLicense = {
  config: {
    seatsUsed: 5,
    seatsLimit: 30,
    selfHostedLicense: {
      expirationDate: '2020-05-09T00:00:00',
    },
  },
}

const mockUnsuccessfulParseError = {}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

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
      graphql.query('SelfHostedSeatsAndLicense', (req, res, ctx) => {
        if (isUnsuccessfulParseError) {
          return res(ctx.status(200), ctx.data(mockUnsuccessfulParseError))
        } else {
          return res(ctx.status(200), ctx.data(mockSelfHostedLicense))
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
            () =>
              useSelfHostedSeatsAndLicense({
                provider: 'gh',
              }),
            { wrapper }
          )

          await waitFor(() => result.current.isSuccess)
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
      beforeEach(() => {
        jest.spyOn(console, 'error')
      })

      afterEach(() => {
        jest.resetAllMocks()
      })

      it('throws a 404', async () => {
        setup({ isUnsuccessfulParseError: true })
        const { result } = renderHook(
          () =>
            useSelfHostedSeatsAndLicense({
              provider: 'gh',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
    })
  })
})
