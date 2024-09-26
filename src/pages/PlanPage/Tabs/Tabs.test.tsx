import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import Tabs from './Tabs'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('config')
vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/analytics/gh/codecov']}>
    <Route path="/analytics/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('Tabs', () => {
  function setup(isSelfHosted: boolean = false) {
    config.IS_SELF_HOSTED = isSelfHosted
    mocks.useFlags.mockReturnValue({ codecovAiFeaturesTab: true })
  }

  describe('when user is part of the org', () => {
    it('renders links to the home page', () => {
      setup()
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /repos/i,
        })
      ).toHaveAttribute('href', '/gh/codecov')
    })

    it('renders links to the analytics page', () => {
      setup()
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /analytics/i,
        })
      ).toHaveAttribute('href', `/analytics/gh/codecov`)
    })

    it('renders links to the settings page', () => {
      setup()
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', `/account/gh/codecov`)
    })

    it('renders link to plan page', () => {
      setup()
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /plan/i,
        })
      ).toHaveAttribute('href', `/plan/gh/codecov`)
    })

    it('renders link to members page', () => {
      setup()
      render(<Tabs />, { wrapper })

      expect(
        screen.getByRole('link', {
          name: /members/i,
        })
      ).toHaveAttribute('href', `/members/gh/codecov`)
    })
  })

  describe('when should render tabs is false', () => {
    it('does not render link to members page', () => {
      setup(true)
      render(<Tabs />, { wrapper })

      expect(
        screen.queryByRole('link', {
          name: /members/i,
        })
      ).not.toBeInTheDocument()
    })

    it('does not render link to plan page', () => {
      setup(true)
      render(<Tabs />, { wrapper })

      expect(
        screen.queryByRole('link', {
          name: /plan/i,
        })
      ).not.toBeInTheDocument()
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
