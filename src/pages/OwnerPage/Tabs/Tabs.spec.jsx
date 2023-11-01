import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Tabs from './Tabs'

jest.mock('./TrialReminder', () => () => 'TrialReminder')
jest.mock('config')

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
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
    { isSelfHosted = false } = {
      isSelfHosted: false,
    }
  ) {
    config.IS_SELF_HOSTED = isSelfHosted
  }

  describe('when user is part of the org', () => {
    it('renders links to the owner settings', () => {
      setup({})

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const settingsLink = screen.getByRole('link', {
        name: /settings/i,
      })
      expect(settingsLink).toBeInTheDocument()
      expect(settingsLink).toHaveAttribute('href', '/account/gh/codecov')
    })

    it('renders link to plan', () => {
      setup({})

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const planLink = screen.getByRole('link', {
        name: /plan/i,
      })
      expect(planLink).toBeInTheDocument()
      expect(planLink).toHaveAttribute('href', '/plan/gh/codecov')
    })

    it('renders link to members page', () => {
      setup({})

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const membersLink = screen.getByRole('link', {
        name: /members/i,
      })
      expect(membersLink).toBeInTheDocument()
      expect(membersLink).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })

  describe('when user is enterprise account', () => {
    it('does not render link to plan', () => {
      setup({ isSelfHosted: true })

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const planLink = screen.queryByRole('link', {
        name: /plan/i,
      })
      expect(planLink).not.toBeInTheDocument()
    })

    it('does not render link to members page', () => {
      setup({ isSelfHosted: true })

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const membersLink = screen.queryByRole('link', {
        name: /members/i,
      })
      expect(membersLink).not.toBeInTheDocument()
    })
  })

  describe('rendering TrialReminder', () => {
    beforeEach(() => {
      setup({ props: { owner: { username: 'kelly' }, provider: 'gh' } })
    })

    it('displays trial reminder', async () => {
      setup({})

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const trialReminder = await screen.findByText('TrialReminder')
      expect(trialReminder).toBeInTheDocument()
    })
  })
})
