import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAccountDetails } from 'services/account'

import BotErrorBanner from './BotErrorBanner.jsx'

jest.mock('services/account')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

describe('BotErrorBanner', () => {
  function setup({ provider, integrationId = null }) {
    useAccountDetails.mockReturnValue({ data: { integrationId } })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/${provider}/codecov`]}>
          <Route path="/:provider/:owner">
            <BotErrorBanner />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('when rendered with gh provider and integration id', () => {
    beforeEach(() => {
      setup({ provider: 'gh', integrationId: 2 })
    })

    it('renders heading of banner', () => {
      expect(screen.getByText(/Team bot/)).toBeInTheDocument()
    })

    it('renders content for gh users that already has gh app installed', () => {
      expect(
        screen.getByText(
          /The bot posts the coverage report comment on pull requests; since the bot is missing the report will not be visible./
        )
      ).toBeInTheDocument()
    })
  })

  describe('when rendered with gh provider and no integration id', () => {
    beforeEach(() => {
      setup({ provider: 'gh' })
    })

    it('renders heading of banner', () => {
      expect(screen.getByText(/Team bot/)).toBeInTheDocument()
    })

    it('renders content for gh users that already has gh app installed', () => {
      expect(
        screen.getByText(
          /The bot posts the coverage report comment on pull requests. If you're using GitHub, the best way to integrate with Codecov.io is to Install/
        )
      ).toBeInTheDocument()
    })
  })

  describe('when rendered with gl provider', () => {
    beforeEach(() => {
      setup({ provider: 'gl' })
    })

    it('renders heading of banner', () => {
      expect(screen.getByText(/Team bot/)).toBeInTheDocument()
    })

    it('renders content for gh users that already has gh app installed', () => {
      expect(
        screen.getByText(
          /The bot posts the coverage report comment on merge request; since the bot is missing the report will not be visible./
        )
      ).toBeInTheDocument()
    })
  })
})
