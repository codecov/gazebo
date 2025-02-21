import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { OktaConfigQueryOpts } from './OktaConfigQueryOpts'

const oktaConfigMock = {
  enabled: true,
  enforced: true,
  url: 'https://okta.com',
  clientId: 'clientId',
  clientSecret: 'clientSecret',
}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useOktaConfig', () => {
  function setup(oktaConfigData = {}) {
    server.use(
      graphql.query('GetOktaConfig', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isUserOktaAuthenticated: true,
              account: { oktaConfig: oktaConfigData },
            },
          },
        })
      })
    )
  }

  describe('calling hook', () => {
    describe('there is valid data', () => {
      it('returns okta config data', async () => {
        setup(oktaConfigMock)

        const { result } = renderHook(
          () =>
            useQueryV5(
              OktaConfigQueryOpts({
                provider: 'gh',
                username: 'codecov',
              })
            ),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            owner: {
              isUserOktaAuthenticated: true,
              account: {
                oktaConfig: oktaConfigMock,
              },
            },
          })
        )
      })
    })

    describe('invalid schema', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('rejects with 404 status', async () => {
        setup({})

        const { result } = renderHook(
          () =>
            useQueryV5(
              OktaConfigQueryOpts({
                provider: 'gh',
                username: 'codecov',
              })
            ),
          { wrapper }
        )

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              dev: 'OktaConfigQueryOpts - Parsing Error',
              status: 400,
            })
          )
        )
      })
    })
  })
})
