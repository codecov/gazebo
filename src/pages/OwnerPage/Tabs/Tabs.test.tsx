import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Tabs from './Tabs'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))
vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})
vi.mock('config')
vi.mock('./TrialReminder', () => ({ default: () => 'TrialReminder' }))

const queryClient = new QueryClient()

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  console.error = () => {}
})
beforeEach(() => {
  queryClient.clear()
})

describe('Tabs', () => {
  function setup(isSelfHosted: boolean = false) {
    config.IS_SELF_HOSTED = isSelfHosted
    mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: true })
  }

  describe('when user is part of the org', () => {
    it('renders links to the owner settings', () => {
      setup()

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const settingsLink = screen.getByRole('link', {
        name: /settings/i,
      })
      expect(settingsLink).toBeInTheDocument()
      expect(settingsLink).toHaveAttribute('href', '/account/gh/codecov')
    })

    it('renders link to plan', () => {
      setup()

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const planLink = screen.getByRole('link', {
        name: /plan/i,
      })
      expect(planLink).toBeInTheDocument()
      expect(planLink).toHaveAttribute('href', '/plan/gh/codecov')
    })

    it('renders link to members page', () => {
      setup()

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
      setup(true)

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const planLink = screen.queryByRole('link', {
        name: /plan/i,
      })
      expect(planLink).not.toBeInTheDocument()
    })

    it('does not render link to members page', () => {
      setup(true)

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const membersLink = screen.queryByRole('link', {
        name: /members/i,
      })
      expect(membersLink).not.toBeInTheDocument()
    })
  })

  describe('rendering TrialReminder', () => {
    it('displays trial reminder', async () => {
      setup()

      render(<Tabs owner={{ username: 'kelly' }} provider="gh" />, { wrapper })

      const trialReminder = await screen.findByText('TrialReminder')
      expect(trialReminder).toBeInTheDocument()
    })
  })

  describe('ai features tab', () => {
    it('does not render tab when flag is off', () => {
      mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: false })
      render(<Tabs />, { wrapper })

      expect(
        screen.queryByRole('link', {
          name: /Codecov AI beta/i,
        })
      ).not.toBeInTheDocument()
    })

    it('renders tab when flag is on', () => {
      setup()
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /Codecov AI beta/i,
        })
      ).toBeInTheDocument()
    })
  })
})
