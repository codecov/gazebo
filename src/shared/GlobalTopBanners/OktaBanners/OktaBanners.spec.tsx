import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import OktaBanners from './OktaBanners'

jest.mock('../OktaEnabledBanner', () => () => 'OktaEnabledBanner')
jest.mock('../OktaEnforcedBanner', () => () => 'OktaEnforcedBanner')
jest.mock('../OktaErrorBanners', () => () => 'OktaErrorBanners')

const wrapper =
  (initialEntries = ['/gh/owner']): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner">
          <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('OktaBanners', () => {
  function setup(data = {}) {
    server.use(
      graphql.query('GetOktaConfig', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
    )
  }

  describe('when owner is not provided', () => {
    it('should render null', async () => {
      setup({
        owner: null,
      })
      const { container } = render(<OktaBanners />, {
        wrapper: wrapper(['/gh']),
      })

      expect(container).toBeEmptyDOMElement()
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
        expect(container).toBeEmptyDOMElement()
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
        expect(container).toBeEmptyDOMElement()
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
        expect(container).toBeEmptyDOMElement()
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
