import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import GithubIntegrationSection from './GithubIntegrationSection'

const server = setupServer()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper =
  (initialEntries = ['/account/gh/codecov']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/account/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
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

describe('GithubIntegrationSection', () => {
  function setup(
    { accountDetails, isSelfHosted } = {
      accountDetails: {},
      isSelfHosted: false,
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted

    server.use(
      http.get(`/internal/gh/codecov/account-details/`, (info) => {
        return HttpResponse.json({
          plan: {
            marketingName: 'users-basic',
            baseUnitPrice: 12,
            benefits: ['Configurable # of users', 'Unlimited repos'],
            quantity: 5,
            value: 'users-inappm',
          },
          activatedUserCount: 2,
          inactiveUserCount: 1,
          integrationId: 2,
          ...accountDetails,
        })
      })
    )
  }

  describe('when rendered for not a github user', () => {
    beforeEach(() => {
      setup()
    })

    it('does not render github integration section', () => {
      const { container } = render(<GithubIntegrationSection />, {
        wrapper: wrapper(['/account/bb/batman']),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when github user but enterprise', () => {
    beforeEach(() => {
      setup({ isSelfHosted: true })
    })

    it('renders nothing', () => {
      const { container } = render(<GithubIntegrationSection />, {
        wrapper: wrapper(),
      })

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('when the user does not have the integration installed', () => {
    beforeEach(() => {
      setup({ accountDetails: { integrationId: null } })
    })

    it('renders the copy to explain the integration', async () => {
      render(<GithubIntegrationSection />, { wrapper: wrapper() })

      const p = await screen.findByText(
        /integrate with codecov through the github app to strengthen codecov's integration with your team\.this will replace the team bot account and post pull request comments on behalf of codecov\./i
      )
      expect(p).toBeInTheDocument()
    })

    it('has a link to the github codecov app', async () => {
      render(<GithubIntegrationSection />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', {
        name: /View the Codecov App on GitHub/i,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/apps/sun-codecov-self-hosted'
      )
    })
  })

  describe('when the user has the integration installed', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the copy to tell the user that the account is using the integration', async () => {
      render(<GithubIntegrationSection />, { wrapper: wrapper() })

      const p = await screen.findByText(
        /This account is configured via the GitHub App. You can manage the apps repository integration on/i
      )
      expect(p).toBeInTheDocument()
    })

    it('has a link to the github integration setting page', async () => {
      render(<GithubIntegrationSection />, { wrapper: wrapper() })

      const link = await screen.findByRole('link', {
        name: /Github/i,
      })
      expect(link).toBeInTheDocument()
    })
  })
})
