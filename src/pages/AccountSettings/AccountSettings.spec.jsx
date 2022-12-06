import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useAccountDetails } from 'services/account'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

import AccountSettings from './AccountSettings'

jest.mock('config')
jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('services/user')
jest.mock('services/account')
jest.mock('shared/featureFlags')

jest.mock('./tabs/Admin', () => () => 'AdminTab')
jest.mock('./tabs/Access', () => () => 'AccessTab')
jest.mock('../NotFound', () => () => 'NotFound')
jest.mock('./tabs/Profile', () => () => 'Profile')
jest.mock('./tabs/YAML', () => () => 'YAMLTab')
jest.mock('./tabs/OrgUploadToken', () => () => 'org upload token tab')
jest.mock('./AccountSettingsSideMenu', () => () => 'AccountSettingsSideMenu')

describe('AccountSettings', () => {
  function setup({
    url = [],
    isAdmin = false,
    isSelfHosted = false,
    showOrgUploadToken = false,
    planValue = 'users-free',
  }) {
    config.IS_SELF_HOSTED = isSelfHosted
    useUser.mockReturnValue({
      data: {
        user: {
          username: 'codecov',
        },
      },
    })
    useFlags.mockReturnValue({ orgUploadToken: showOrgUploadToken })

    useIsCurrentUserAnAdmin.mockReturnValue(isAdmin)
    useAccountDetails.mockReturnValue({
      data: { plan: { value: planValue } },
    })

    render(
      <MemoryRouter initialEntries={[url]}>
        <Route path="/account/:provider/:owner/">
          <AccountSettings />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when not running in self hosted mode', () => {
    describe('when attempting to access admin tab', () => {
      describe('when user is an admin', () => {
        beforeEach(() => {
          setup({
            url: '/account/gh/codecov',
            isAdmin: true,
          })
        })

        it('renders the admin tab', async () => {
          const tab = await screen.findByText('AdminTab')

          expect(tab).toBeInTheDocument()
        })
      })

      describe('when user is not an admin', () => {
        beforeEach(() => {
          setup({
            url: '/account/gh/codecov',
            isAdmin: false,
          })
        })

        it('redirects to yaml tab', async () => {
          const tab = await screen.findByText('YAMLTab')

          expect(tab).toBeInTheDocument()
        })
      })
    })

    describe('when attempting to access yaml tab', () => {
      beforeEach(() => {
        setup({
          url: '/account/gh/codecov/yaml',
        })
      })

      it('renders the yaml tab', async () => {
        const tab = await screen.findByText('YAMLTab')

        expect(tab).toBeInTheDocument()
      })
    })

    describe('when attempting to access access tab', () => {
      beforeEach(() => {
        setup({
          url: '/account/gh/codecov/access',
        })
      })

      it('renders access tab', async () => {
        const tab = await screen.findByText('AccessTab')

        expect(tab).toBeInTheDocument()
      })
    })
  })

  describe('when running in self hosted mode', () => {
    describe('when attempted to access the profile tab', () => {
      beforeEach(() => {
        setup({
          url: '/account/gh/codecov',
          isSelfHosted: true,
        })
      })

      it('renders profile tab', async () => {
        const tab = await screen.findByText('Profile')

        expect(tab).toBeInTheDocument()
      })
    })

    describe('when navigating to the yaml tab', () => {
      beforeEach(() => {
        setup({
          url: '/account/gh/codecov/yaml',
          isSelfHosted: true,
        })
      })

      it('renders the yaml tab', async () => {
        const tab = await screen.findByText('YAMLTab')

        expect(tab).toBeInTheDocument()
      })
    })
  })
  describe('when going to an unknown page', () => {
    beforeEach(() => {
      setup({
        url: '/account/gh/codecov/ahhhhhhhhh',
      })
    })
    it('renders not found tab', async () => {
      const tab = await screen.findByText('NotFound')

      expect(tab).toBeInTheDocument()
    })
  })

  describe('when navigating to the org upload token tab', () => {
    beforeEach(() => {
      setup({
        url: '/account/gh/codecov/orgUploadToken',
        showOrgUploadToken: true,
        planValue: 'users-enterprisem',
      })
    })

    it('renders the org upload token tab', async () => {
      const tab = await screen.findByText('org upload token tab')

      expect(tab).toBeInTheDocument()
    })
  })
})
