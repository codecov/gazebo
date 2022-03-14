import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import AppLink from '.'

describe('AppLink', () => {
  function setup(props = {}, location = '/gh/codecov') {
    render(<AppLink {...props} />, {
      wrapper: (props) => (
        <MemoryRouter initialEntries={[location]} initialIndex={0}>
          <Switch>
            <Route path="/account/:provider/:owner">{props.children}</Route>
            <Route path="/:provider/:owner">{props.children}</Route>
          </Switch>
        </MemoryRouter>
      ),
    })
  }

  describe('when rendered to a link we have in gazebo', () => {
    beforeEach(() => {
      setup({
        pageName: 'account',
        options: {
          provider: 'gh',
          owner: 'spotify',
        },
      })
    })

    it('renders a link with the right URL', () => {
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        '/account/gh/spotify'
      )
    })

    it('attaches a hook for e2e tests', () => {
      expect(screen.getByRole('link')).toHaveAttribute('data-cy', 'account')
    })

    it('attaches a hook for marketing tracking', () => {
      expect(screen.getByRole('link')).toHaveAttribute(
        'data-marketing',
        'account'
      )
    })
  })

  describe('when rendered to a link we dont have in gazebo', () => {
    beforeEach(() => {
      setup({
        pageName: 'freshdesk',
      })
    })

    it('renders a link with the right URL', () => {
      expect(screen.getByRole('link')).toHaveAttribute(
        'href',
        'https://codecov.freshdesk.com/support/home'
      )
    })
  })

  describe("when we don't have the link", () => {
    beforeEach(() => {
      setup({
        pageName: 'blabla',
      })
    })

    it('renders nothing', () => {
      expect(screen.queryByRole('link')).toBe(null)
    })
  })

  describe('when activeClassName is passed and the route is active', () => {
    beforeEach(() => {
      setup(
        {
          pageName: 'account',
          options: {
            provider: 'gh',
            owner: 'codecov',
          },
          className: 'blue',
          activeClassName: 'red',
        },
        '/account/gh/codecov'
      )
    })

    it('renders the link with the activeClassName', () => {
      expect(screen.queryByRole('link')).toHaveAttribute('class', 'blue red')
    })
  })

  describe('when activeClassName is passed and the route isnt active', () => {
    beforeEach(() => {
      setup({
        pageName: 'account',
        options: {
          provider: 'gh',
          owner: 'codecov',
        },
        className: 'blue',
        activeClassName: 'red',
      })
    })

    it('renders the link without activeClassName', () => {
      expect(screen.queryByRole('link')).toHaveAttribute('class', 'blue')
    })
  })
})
