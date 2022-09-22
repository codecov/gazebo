import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'

import AccountSettingsSideMenu from './AccountSettingsSideMenu'

jest.mock('config')
jest.mock('services/user')

describe('AccountSettingsSideMenu', () => {
  function setup({
    entries = [],
    isAdmin = false,
    user = {},
    isSelfHosted = false,
  }) {
    config.IS_ENTERPRISE = isSelfHosted
    useIsCurrentUserAnAdmin.mockReturnValue(isAdmin)
    useUser.mockReturnValue({ data: user })

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

    it('does not show admin link', () => {
      const link = screen.queryByText('Admin')

      expect(link).not.toBeInTheDocument()
    })

    it('displays yaml link', async () => {
      const link = await screen.findByText('Global YAML')

      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/account/gh/codecov-org/yaml')
    })

    it('does not show the access link', () => {
      const link = screen.queryByText('Access')

      expect(link).not.toBeInTheDocument()
    })
  })
})
