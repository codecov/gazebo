import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { TierNames } from 'services/tier'

import Tabs from './Tabs'

jest.mock('config')

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/members/gh/codecov']}>
      <Route path="/members/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
  console.error = () => {}
})
beforeEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('Tabs', () => {
  function setup(
    { isSelfHosted = false, tierValue = TierNames.PRO } = {
      isSelfHosted: false,
      tierValue: TierNames.PRO,
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted

    server.use(
      graphql.query('OwnerTier', (req, res, ctx) => {
        if (tierValue === TierNames.TEAM) {
          return res(
            ctx.status(200),
            ctx.data({ owner: { plan: { tierName: TierNames.TEAM } } })
          )
        }
        return res(
          ctx.status(200),
          ctx.data({ owner: { plan: { tierName: TierNames.PRO } } })
        )
      })
    )
  }

  describe('when user is part of the org', () => {
    it('renders links to the home page', () => {
      setup({})
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /repos/i,
        })
      ).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders links to the analytics page', () => {
      setup({})
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /analytics/i,
        })
      ).toHaveAttribute('href', `/analytics/gh/codecov`)
    })

    it('renders links to the settings page', () => {
      setup({})
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', `/account/gh/codecov`)
    })

    it('renders link to plan page', () => {
      setup({})
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /plan/i,
        })
      ).toHaveAttribute('href', `/plan/gh/codecov`)
    })

    it('renders link to members page', () => {
      setup({})
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /members/i,
        })
      ).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })

  describe('when user is enterprise account', () => {
    it('does not render link to members page', () => {
      setup({ isSelfHosted: true })
      render(<Tabs />, { wrapper })

      expect(
        screen.queryByRole('link', {
          name: /members/i,
        })
      ).not.toBeInTheDocument()
    })

    it('does not render link to plan page', () => {
      setup({ isSelfHosted: true })
      render(<Tabs />, { wrapper })

      expect(
        screen.queryByRole('link', {
          name: /plan/i,
        })
      ).not.toBeInTheDocument()
    })
  })

  describe('when user has team tier', () => {
    it('renders links to the home page', () => {
      setup({ tierValue: TierNames.TEAM })
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /repos/i,
        })
      ).toHaveAttribute('href', '/gh/codecov')
    })

    it('does not render links to the analytics page', async () => {
      setup({ tierValue: TierNames.TEAM })
      render(<Tabs />, { wrapper })

      const analyticsLink = screen.queryByText(/Analytics/)
      await waitFor(() => expect(analyticsLink).not.toBeInTheDocument())
    })

    it('renders links to the settings page', () => {
      setup({ tierValue: TierNames.TEAM })
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', `/account/gh/codecov`)
    })

    it('renders link to plan page', () => {
      setup({ tierValue: TierNames.TEAM })
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /plan/i,
        })
      ).toHaveAttribute('href', `/plan/gh/codecov`)
    })

    it('renders link to members page', () => {
      setup({ tierValue: TierNames.TEAM })
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /members/i,
        })
      ).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })
})
