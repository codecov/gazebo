import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import CallToAction from './CallToAction'

describe('CallToAction', () => {
  function setup(props = {}) {
    render(
      <MemoryRouter initialEntries={['/gh/codecov']}>
        <Route path="/:provider/:owner">
          <CallToAction
            owner={props.owner}
            accountDetails={props.accountDetails}
          />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when user is under free trial', () => {
    it('renders "request free trial" text if there are is less than 5 activated users', () => {
      setup({
        owner: {
          username: 'codecov',
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
