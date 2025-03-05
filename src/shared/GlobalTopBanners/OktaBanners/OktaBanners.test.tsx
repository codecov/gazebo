import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import OktaBanners from './OktaBanners'

vi.mock('../OktaEnabledBanner', () => ({ default: () => 'OktaEnabledBanner' }))
vi.mock('../OktaEnforcedBanner', () => ({
  default: () => 'OktaEnforcedBanner',
}))
vi.mock('../OktaErrorBanners', () => ({
  default: () => 'OktaErrorBanners',
}))

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = ['/gh/owner']): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner">
            <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  queryClient.clear()
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('OktaBanners', () => {
  function setup(data = {}) {
    server.use(
      graphql.query('GetOktaConfig', () => {
        return HttpResponse.json({ data: data })
      })
    )
  }

  describe('when owner is not provided', () => {
    it('should render null', async () => {
      setup({ owner: null })
      const { container } = render(<OktaBanners />, {
        wrapper: wrapper(['/gh']),
      })

      await waitFor(() => expect(container).toBeEmptyDOMElement())
    })
  })

  describe('when owner is provided', () => {
    describe('when user is not Okta authenticated', () => {
      it('should render null', async () => {
        setup({
          owner: {
            isUserOktaAuthenticated: false,
            account: {
              oktaConfig: {
                enabled: false,
                enforced: false,
                url: 'https://okta.com',
                clientId: 'clientId',
                clientSecret: 'clientSecret',
              },
            },
          },
        })

        const { container } = render(<OktaBanners />, { wrapper: wrapper() })
        await waitFor(() => expect(container).toBeEmptyDOMElement())
      })
    })

    describe('when Okta is not enabled', () => {
      it('should render null', async () => {
        setup({
          owner: {
            isUserOktaAuthenticated: false,
            account: {
              oktaConfig: {
                enabled: false,
                enforced: false,
                url: 'https://okta.com',
                clientId: 'clientId',
                clientSecret: 'clientSecret',
              },
            },
          },
        })

        const { container } = render(<OktaBanners />, { wrapper: wrapper() })
        await waitFor(() => expect(container).toBeEmptyDOMElement())
      })
    })

    describe('when user is already Okta authenticated', () => {
      it('should render null', async () => {
        setup({
          owner: {
            isUserOktaAuthenticated: true,
            account: {
              oktaConfig: {
                enabled: true,
                enforced: false,
                url: 'https://okta.com',
                clientId: 'clientId',
                clientSecret: 'clientSecret',
              },
            },
          },
        })

        const { container } = render(<OktaBanners />, { wrapper: wrapper() })
        await waitFor(() => expect(container).toBeEmptyDOMElement())
      })
    })

    describe('when Okta is enabled', () => {
      describe('when Okta is not enforced', () => {
        it('should render OktaEnabledBanner', async () => {
          setup({
            owner: {
              isUserOktaAuthenticated: false,
              account: {
                oktaConfig: {
                  enabled: true,
                  enforced: false,
                  url: 'https://okta.com',
                  clientId: 'clientId',
                  clientSecret: 'clientSecret',
                },
              },
            },
          })

          render(<OktaBanners />, { wrapper: wrapper() })
          const banner = await screen.findByText(/OktaEnabledBanner/)
          expect(banner).toBeInTheDocument()
        })

        it('should render OktaErrorBanners', async () => {
          setup({
            owner: {
              isUserOktaAuthenticated: false,
              account: {
                oktaConfig: {
                  enabled: true,
                  enforced: false,
                  url: 'https://okta.com',
                  clientId: 'clientId',
                  clientSecret: 'clientSecret',
                },
              },
            },
          })

          render(<OktaBanners />, { wrapper: wrapper() })
          const banner = await screen.findByText(/OktaErrorBanners/)
          expect(banner).toBeInTheDocument()
        })
      })

      describe('when Okta is enforced', () => {
        it('should render OktaEnforcedBanner', async () => {
          setup({
            owner: {
              isUserOktaAuthenticated: false,
              account: {
                oktaConfig: {
                  enabled: true,
                  enforced: true,
                  url: 'https://okta.com',
                  clientId: 'clientId',
                  clientSecret: 'clientSecret',
                },
              },
            },
          })

          render(<OktaBanners />, { wrapper: wrapper() })

          const banner = await screen.findByText(/OktaEnforcedBanner/)
          expect(banner).toBeInTheDocument()
        })

        it('should render OktaErrorBanners', async () => {
          setup({
            owner: {
              isUserOktaAuthenticated: false,
              account: {
                oktaConfig: {
                  enabled: true,
                  enforced: true,
                  url: 'https://okta.com',
                  clientId: 'clientId',
                  clientSecret: 'clientSecret',
                },
              },
            },
          })

          render(<OktaBanners />, { wrapper: wrapper() })
          const banner = await screen.findByText(/OktaErrorBanners/)
          expect(banner).toBeInTheDocument()
        })
      })
    })
  })
})
