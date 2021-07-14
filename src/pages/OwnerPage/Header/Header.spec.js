import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <Header owner={props.owner} currentUser={props.currentUser} />
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
        currentUser: {
          username: 'caleb',
          plan: 'users-free',
          planUserCount: 5,
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
        currentUser: {
          username: 'caleb',
          plan: 'users-free',
          planUserCount: 5,
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
    it('renders "request free trial" text if user count is less than 5 but not 0', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        currentUser: {
          username: 'caleb',
          plan: 'users-free',
          planUserCount: 2,
        },
      })
      expect(screen.getByRole('link', { name: /request/i })).toHaveAttribute(
        'href',
        'https://about.codecov.io/trial'
      )
    })

    it('renders "upgrade plan today" when there are 0 seats remaining', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        currentUser: {
          username: 'caleb',
          plan: 'users-free',
          planUserCount: 0,
        },
      })
      expect(screen.getByRole('link', { name: /upgrade/i })).toHaveAttribute(
        'href',
        '/account/gh/caleb/billing/upgrade'
      )
    })

    it('does not render any trial if user count is outside 0-5 range', () => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: true,
        },
        currentUser: {
          username: 'caleb',
          plan: 'users-free',
          planUserCount: 9,
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
        currentUser: {
          username: 'caleb',
          plan: 'not-users-free',
          planUserCount: 5,
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
