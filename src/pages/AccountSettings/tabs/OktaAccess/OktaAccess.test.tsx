import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import OktaAccess from './OktaAccess'

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true, retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/account/gh/codecov/okta-access/']}>
        <Route path="/account/:provider/:owner/okta-access/">
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  </QueryClientProviderV5>
)

const server = setupServer()
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('OktaAccess', () => {
  function setup({ isAdmin = false } = {}) {
    server.use(
      graphql.query('DetailOwner', () => {
        return HttpResponse.json({
          data: { owner: { username: 'codecov', isAdmin } },
        })
      }),
      graphql.query('GetOktaConfig', () => {
        return HttpResponse.json({
          data: {
            owner: {
              isUserOktaAuthenticated: true,
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
          },
        })
      })
    )
  }

  it('should render okta access header', async () => {
    setup()
    render(<OktaAccess />, { wrapper })

    const header = await screen.findByText(/Okta access/)
    expect(header).toBeInTheDocument()
  })

  it('should render okta access description', async () => {
    setup()
    render(<OktaAccess />, { wrapper })

    const description = await screen.findByText(
      /Configure your Okta integration to enable single sign-on \(SSO\) for your Codecov account./
    )
    expect(description).toBeInTheDocument()
  })

  it('should render Okta access form when user is admin', async () => {
    setup({ isAdmin: true })
    render(<OktaAccess />, { wrapper })

    const form = await screen.findByText(/Step 1: Enable Okta Sync/)
    expect(form).toBeInTheDocument()
  })

  it('should render AdminAuthorizationBanner when user is not admin', async () => {
    setup({ isAdmin: false })
    render(<OktaAccess />, { wrapper })

    const banner = await screen.findByText(/Admin authorization required/)
    expect(banner).toBeInTheDocument()
  })
})
