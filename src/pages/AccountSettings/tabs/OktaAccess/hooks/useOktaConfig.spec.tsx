import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useOktaConfig } from './useOktaConfig'

const oktaConfigMock = {
  enabled: true,
  enforced: true,
  url: 'https://okta.com',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
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

describe('useOktaConfig', () => {
  function setup(oktaConfigData = {}) {
    server.use(
      graphql.query('GetOktaConfig', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              account: { oktaConfig: oktaConfigData },
            },
          })
        )
      )
    )
  }

  describe('calling hook', () => {
    describe('there is valid data', () => {
      it('returns okta config data', async () => {
        setup(oktaConfigMock)

        const { result } = renderHook(
          () =>
            useOktaConfig({
              provider: 'gh',
              username: 'codecov',
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            owner: {
              account: {
                oktaConfig: oktaConfigMock,
              },
            },
          })
        )
      })
    })

    describe('invalid schema', () => {
      it('rejects with 404 status', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            useOktaConfig({
              provider: 'gh',
              username: 'codecov',
            }),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.error).toStrictEqual({
            status: 404,
            data: {},
            dev: 'useOktaConfig - 404 failed to parse',
          })
        )
      })
    })
  })
})
