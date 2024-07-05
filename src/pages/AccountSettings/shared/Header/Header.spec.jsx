import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useFlags } from 'shared/featureFlags'

import Header from './Header'

jest.mock('config')

// temp, for new header work
jest.mock('shared/featureFlags')
jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/account/gh/codecov']}>
      <Route path="/account/:provider/:owner">{children}</Route>
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

describe('Header', () => {
  function setup(
    { isSelfHosted = false } = {
      isSelfHosted: false,
    }
  ) {
    useFlags.mockReturnValue({
      newHeader: false,
    })
    config.IS_SELF_HOSTED = isSelfHosted
  }

  describe('when users is part of the org', () => {
    it('renders links to the home page', () => {
      setup()
      render(<Header />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /repos/i,
        })
      ).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders links to the analytics page', () => {
      setup()
      render(<Header />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /analytics/i,
        })
      ).toHaveAttribute('href', `/analytics/gh/codecov`)
    })

    it('renders links to the settings page', () => {
      setup()
      render(<Header />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', `/account/gh/codecov`)
    })

    it('renders link to plan page', () => {
      setup()
      render(<Header />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /plan/i,
        })
      ).toHaveAttribute('href', `/plan/gh/codecov`)
    })

    it('renders link to members page', () => {
      setup()
      render(<Header />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /members/i,
        })
      ).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })

  describe('when rendered with enterprise account', () => {
    it('does not render link to members page', () => {
      setup({ isSelfHosted: true })
      render(<Header />, { wrapper })

      expect(
        screen.queryByRole('link', {
          name: /members/i,
        })
      ).not.toBeInTheDocument()
    })

    it('does not render link to plan page', () => {
      setup({ isSelfHosted: true })
      render(<Header />, { wrapper })

      expect(
        screen.queryByRole('link', {
          name: /plan/i,
        })
      ).not.toBeInTheDocument()
    })
  })

  describe('header feature flagging', () => {
    it('renders header when flag is false', async () => {
      setup()
      render(<Header />, { wrapper })

      const header = await screen.findByText('MyContextSwitcher')
      expect(header).toBeInTheDocument()
    })

    it('does not render header when flag is true', async () => {
      setup()
      useFlags.mockReturnValue({
        newHeader: true,
      })
      render(<Header />, { wrapper })

      const header = screen.queryByText('MyContextSwitcher')
      expect(header).not.toBeInTheDocument()
    })
  })
})
