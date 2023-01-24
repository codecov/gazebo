import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useAccountDetails } from 'services/account'
import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

import AccountSettingsSideMenu from './AccountSettingsSideMenu'

jest.mock('config')
jest.mock('services/user')
jest.mock('services/account')
jest.mock('shared/featureFlags')

describe('AccountSettingsSideMenu', () => {
  function setup({
    entries = [],
    isAdmin = false,
    user = {},
    isSelfHosted = false,
    planValue = 'users-free',
    orgUploadTokenFlag = false,
  }) {
    config.IS_SELF_HOSTED = isSelfHosted
    useIsCurrentUserAnAdmin.mockReturnValue(isAdmin)
    useUser.mockReturnValue({ data: user })
    useAccountDetails.mockReturnValue({ data: { plan: { value: planValue } } })
    useFlags.mockReturnValue({ orgUploadToken: orgUploadTokenFlag })

    render(
      <MemoryRouter initialEntries={entries}>
        <Route path="/account/:provider/:owner/">
          <AccountSettingsSideMenu />
        </Route>
      </MemoryRouter>
    )
  }

  describe('user is not an admin', () => {
    describe('user is looking at their personal org', () => {
      beforeEach(() => {
        setup({
          entries: ['/account/gh/codecov'],
          isAdmin: false,
          user: {
            user: {
              username: 'codecov',
            },
          },
        })
      })

      it('does not show admin link', () => {
        const link = screen.queryByText('Admin')

        expect(link).not.toBeInTheDocument()
      })

      it('shows  internal access link', async () => {
        const link = await screen.findByText('Access')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
      })

      it('displays yaml link', async () => {
        const link = await screen.findByText('Global YAML')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
      })
    })

    describe('user is not looking a their personal org', () => {
      beforeEach(() => {
        setup({
          entries: ['/account/gh/codecov-org'],
          isAdmin: false,
          user: {
            user: {
              username: 'codecov',
            },
          },
        })
      })

      it('does not show admin link', () => {
        const link = screen.queryByText('Admin')

        expect(link).not.toBeInTheDocument()
      })

      it('does not show internal access link', () => {
        const link = screen.queryByText('Access')

        expect(link).not.toBeInTheDocument()
      })

      it('displays yaml link', async () => {
        const link = await screen.findByText('Global YAML')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov-org/yaml')
      })
    })
  })

  describe('user is an admin', () => {
    describe('user is looking at their personal org', () => {
      beforeEach(() => {
        setup({
          entries: ['/account/gh/codecov'],
          isAdmin: true,
          user: {
            user: {
              username: 'codecov',
            },
          },
        })
      })

      it('shows admin link', async () => {
        const link = await screen.findByText('Admin')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov')
      })

      it('shows internal access link', async () => {
        const link = await screen.findByText('Access')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/access')
      })

      it('displays yaml link', async () => {
        const link = await screen.findByText('Global YAML')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
      })
    })

    describe('user is not looking a their personal org', () => {
      beforeEach(() => {
        setup({
          entries: ['/account/gh/codecov-org'],
          isAdmin: true,
          user: {
            user: {
              username: 'codecov',
            },
          },
        })
      })

      it('shows admin link', async () => {
        const link = await screen.findByText('Admin')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov-org')
      })

      it('does not show internal access link', () => {
        const link = screen.queryByText('Access')

        expect(link).not.toBeInTheDocument()
      })

      it('displays yaml link', async () => {
        const link = await screen.findByText('Global YAML')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov-org/yaml')
      })
    })
  })

  describe('codecov is running in self hosted mode', () => {
    describe('user is looking at their own settings', () => {
      beforeEach(() => {
        setup({
          entries: ['/account/gh/codecov'],
          isAdmin: true,
          user: {
            user: {
              username: 'codecov',
            },
          },
          isSelfHosted: true,
        })
      })

      it('displays profile link', async () => {
        const link = await screen.findByText('Profile')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov')
      })

      it('displays yaml link', async () => {
        const link = await screen.findByText('Global YAML')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov/yaml')
      })
    })

    describe('user is not looking at their own settings', () => {
      beforeEach(() => {
        setup({
          entries: ['/account/gh/codecov-org'],
          isAdmin: true,
          user: {
            user: {
              username: 'codecov',
            },
          },
          isSelfHosted: true,
        })
      })

      it('does not display profile link', () => {
        const link = screen.queryByText('Profile')

        expect(link).not.toBeInTheDocument()
      })

      it('displays yaml link', async () => {
        const link = await screen.findByText('Global YAML')

        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/account/gh/codecov-org/yaml')
      })
    })
  })

  describe('when rendering for enterprise cloud users', () => {
    beforeEach(() => {
      setup({
        entries: ['/account/gh/rula'],
        isAdmin: false,
        planValue: 'users-enterprisem',
        orgUploadTokenFlag: true,
      })
    })

    it('renders Global Upload Token link', () => {
      expect(
        screen.getByRole('link', { name: /Global Upload Token/i })
      ).toBeInTheDocument()
    })
  })
})
