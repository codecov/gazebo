import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import AppLink from './AppLink'

const wrapper =
  (location = '/gh/codecov') =>
  ({ children }) => (
    <MemoryRouter initialEntries={[location]} initialIndex={0}>
      <Switch>
        <Route path="/account/:provider/:owner">{children}</Route>
        <Route path="/:provider/:owner">{children}</Route>
      </Switch>
    </MemoryRouter>
  )

describe('AppLink', () => {
  describe('when rendered to a link we have in gazebo', () => {
    it('renders a link with the right URL', () => {
      render(
        <AppLink
          pageName="account"
          options={{ provider: 'gh', owner: 'spotify' }}
        />,
        { wrapper: wrapper() }
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/account/gh/spotify')
    })

    it('attaches a hook for e2e tests', () => {
      render(
        <AppLink
          pageName="account"
          options={{ provider: 'gh', owner: 'spotify' }}
        />,
        { wrapper: wrapper() }
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('data-cy', 'account')
    })

    it('attaches a hook for marketing tracking', () => {
      render(
        <AppLink
          pageName="account"
          options={{ provider: 'gh', owner: 'spotify' }}
        />,
        { wrapper: wrapper() }
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('data-marketing', 'account')
    })
  })

  describe('when rendered to a link we do not have in gazebo', () => {
    it('renders a link with the right URL', () => {
      render(<AppLink pageName="support" />, { wrapper: wrapper() })

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute(
        'href',
        'https://codecovpro.zendesk.com/hc/en-us'
      )
    })
  })

  describe("when we don't have the link", () => {
    it('renders nothing', () => {
      render(<AppLink pageName="blabla" />, { wrapper: wrapper })

      const link = screen.queryByRole('link')
      expect(link).toBe(null)
    })
  })

  describe('when activeClassName is passed and the route is active', () => {
    it('renders the link with the activeClassName', () => {
      render(
        <AppLink
          pageName="account"
          className="text-blue-500"
          activeClassName="text-red-500"
          options={{ provider: 'gh', owner: 'codecov' }}
        />,
        { wrapper: wrapper('/account/gh/codecov') }
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('class', 'text-blue-500 text-red-500')
    })
  })

  describe('when activeClassName is passed and the route is not active', () => {
    it('renders the link without activeClassName', () => {
      render(
        <AppLink
          pageName="account"
          className="text-blue-500"
          activeClassName="text-red-500"
          options={{ provider: 'gh', owner: 'codecov' }}
        />,
        { wrapper: wrapper() }
      )

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('class', 'text-blue-500')
    })
  })
})
