import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <Header owner={props.owner} accountDetails={props.accountDetails} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        accountDetails: {
          activatedUserCount: 0,
          plan: {
            value: 'users-free',
          },
        },
      })
    })

    it('renders links to the owner settings', () => {
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/codecov')
    })

    it('renders the context switcher', () => {
      expect(screen.getByText(/MyContextSwitcher/)).toBeInTheDocument()
    })
  })

  describe('when user is not part of the org', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
        },
        accountDetails: {
          activatedUserCount: 0,
          plan: {
            value: 'users-free',
          },
        },
      })
    })

    it('renders the title of the owner', () => {
      expect(
        screen.getByRole('heading', {
          name: /codecov/i,
        })
      ).toBeInTheDocument()
    })

    it('doesnt render the context switcher', () => {
      expect(screen.queryByText(/MyContextSwitcher/)).not.toBeInTheDocument()
    })

    it('doesnt render links to the settings', () => {
      expect(
        screen.queryByRole('link', {
          name: /settings/i,
        })
      ).not.toBeInTheDocument()
    })
  })

  describe('when user is under free trial', () => {
    it('renders "request free trial" text if there are is less than 5 activated users', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        accountDetails: {
          activatedUserCount: 2,
          plan: {
            value: 'users-free',
          },
        },
      })
      expect(screen.getByRole('link', { name: /request/i })).toHaveAttribute(
        'href',
        'https://about.codecov.io/trial'
      )
    })

    it('renders "upgrade plan today" when user has used all seats', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        accountDetails: {
          activatedUserCount: 5,
          plan: {
            value: 'users-free',
          },
        },
      })
      expect(screen.getByRole('link', { name: /upgrade/i })).toHaveAttribute(
        'href',
        '/account/gh/codecov/billing/upgrade'
      )
    })

    it('does not render any trial if user count is outside 0-5 range', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        accountDetails: {
          activatedUserCount: 9,
          plan: {
            value: 'users-free',
          },
        },
      })
      expect(screen.queryByText(/Need more than 5 users?/)).toBeNull()
      expect(screen.queryByText(/Request/)).toBeNull()
      expect(screen.queryByText(/free trial/)).toBeNull()

      expect(screen.queryByText(/Looks like you're up to 5 users./)).toBeNull()
      expect(screen.queryByText(/Upgrade/)).toBeNull()
      expect(screen.queryByText(/plan today/)).toBeNull()
    })
  })

  describe('when user is not under free trial', () => {
    it('does not render any trial', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        accountDetails: {
          activatedUserCount: 5,
          plan: {
            value: 'not-users-free',
          },
        },
      })
      expect(screen.queryByText(/Need more than 5 users?/)).toBeNull()
      expect(screen.queryByText(/Request/)).toBeNull()
      expect(screen.queryByText(/free trial/)).toBeNull()

      expect(screen.queryByText(/Looks like you're up to 5 users./)).toBeNull()
      expect(screen.queryByText(/Upgrade/)).toBeNull()
      expect(screen.queryByText(/plan today/)).toBeNull()
    })
  })
})
