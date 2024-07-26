import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useOwner } from 'services/user'
import { useFlags } from 'shared/featureFlags'

import SettingsTab from './SettingsTab'

jest.mock('services/user')
const mockedUseOwner = useOwner as jest.Mock
jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock

jest.mock('./tabs/GeneralTab', () => () => 'General Tab')

const wrapper: (initialEntries?: string) => React.FC<React.PropsWithChildren> =
  (initialEntries = '/gh/codecov/codecov-client/settings') =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/:provider/:owner/:repo/settings">{children}</Route>
    </MemoryRouter>
  )

interface SetupArgs {
  isCurrentUserPartOfOrg?: boolean
}

describe('SettingsTab', () => {
  function setup({ isCurrentUserPartOfOrg = true }: SetupArgs) {
    mockedUseOwner.mockReturnValue({ data: { isCurrentUserPartOfOrg } })
    mockedUseFlags.mockReturnValue({ inAppMarketingTab: true })
  }

  describe('Render for a repo', () => {
    it('renders the right links', async () => {
      setup({})
      render(<SettingsTab />, { wrapper: wrapper() })

      expect(
        await screen.findByRole('link', { name: /General/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Configuration Manager/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Yaml/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Badge/ })
      ).toBeInTheDocument()
    })

    describe('with feature flag false', () => {
      it('does not render the Configuration Manager tab', async () => {
        setup({})
        mockedUseFlags.mockReturnValue({ inAppMarketingTab: false })
        render(<SettingsTab />, { wrapper: wrapper() })

        expect(
          await screen.findByRole('link', { name: /General/ })
        ).toBeInTheDocument()
        expect(
          screen.queryByRole('link', { name: /Configuration Manager/ })
        ).not.toBeInTheDocument()
        expect(
          await screen.findByRole('link', { name: /Yaml/ })
        ).toBeInTheDocument()
        expect(
          await screen.findByRole('link', { name: /Badge/ })
        ).toBeInTheDocument()
      })
    })
  })

  describe('Render with an unknown path', () => {
    it('renders the right links', async () => {
      setup({})
      render(<SettingsTab />, {
        wrapper: wrapper('/gh/codecov/codecov-client/settings/random'),
      })

      expect(
        await screen.findByRole('link', { name: /General/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Configuration Manager/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Yaml/ })
      ).toBeInTheDocument()
      expect(
        await screen.findByRole('link', { name: /Badge/ })
      ).toBeInTheDocument()
    })
  })

  describe('Render with user not part of org', () => {
    it('renders 404', async () => {
      setup({ isCurrentUserPartOfOrg: false })
      render(<SettingsTab />, { wrapper: wrapper() })

      expect(await screen.findByText('Error 404')).toBeInTheDocument()
    })
  })
})
