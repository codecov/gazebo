import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import Header from './Header'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')

describe('Header', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh']}>
        <Route path="/:provider">
          <Header currentUser={props} />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendered', () => {
    it('renders links to the current user settings', () => {
      setup({
        username: 'lewis',
        plan: 'users-free',
        planUserCount: 5,
      })
      expect(
        screen.getByRole('link', {
          name: /settings/i,
        })
      ).toHaveAttribute('href', '/account/gh/lewis')
    })

    it('renders "request free trial" text if user plan is free', () => {
      setup({
        username: 'lewis',
        plan: 'users-free',
        planUserCount: 5,
      })
      expect(screen.getByRole('link', { name: /request/i })).toHaveAttribute(
        'href',
        'https://about.codecov.io/trial'
      )
    })

    it('renders "upgrade plan today" with free plan and 0 seats remaining', () => {
      setup({
        username: 'lewis',
        plan: 'users-free',
        planUserCount: 0,
      })
      expect(screen.getByRole('link', { name: /upgrade/i })).toHaveAttribute(
        'href',
        '/account/gh/lewis/billing/upgrade'
      )
    })

    it('does not render any trial if user plan is not free', () => {
      setup({
        username: 'lewis',
        plan: 'not-users-free',
        planUserCount: 5,
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
