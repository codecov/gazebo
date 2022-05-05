import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'

import AccountSettings from './AccountSettings'

jest.mock('layouts/MyContextSwitcher', () => () => 'MyContextSwitcher')
jest.mock('./tabs/Admin', () => () => 'AdminTab')
jest.mock('./tabs/BillingAndUsers', () => () => 'BillingAndUsersTab')
jest.mock('./tabs/CancelPlan', () => () => 'CancelPlan')
jest.mock('./tabs/YAML', () => () => 'YAMLTab')
jest.mock('./tabs/CancelPlan', () => () => 'CancelPlanTab')
jest.mock('./tabs/UpgradePlan', () => () => 'UpgradePlan')
jest.mock('./tabs/InvoiceDetail', () => () => 'InvoiceDetail')
jest.mock('services/user/hooks')

describe('AccountSettings', () => {
  function setup({ url, isAdmin }) {
    useUser.mockReturnValue({
      data: {
        user: {
          username: 'dorian',
        },
      },
    })

    useIsCurrentUserAnAdmin.mockReturnValue(isAdmin)

    render(
      <MemoryRouter initialEntries={[url]}>
        <Route path="/account/:provider/:owner/">
          <AccountSettings />
        </Route>
      </MemoryRouter>
    )
  }

  describe('when rendering for an organization', () => {
    beforeEach(() => {
      setup({ url: '/account/gh/codecov', isAdmin: true })
    })

    it('renders the right links', () => {
      expect(screen.getByRole('link', { name: /Admin/ })).toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /Access/ })
      ).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /YAML/ })).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /billing & users/i })
      ).toBeInTheDocument()
    })
  })

  describe('when rendering for admin users and is personal settings', () => {
    beforeEach(() => {
      setup({ url: '/account/gh/dorian', isAdmin: true })
    })

    it('renders the right links', () => {
      expect(screen.getByRole('link', { name: /Admin/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Access/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /YAML/ })).toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /billing & users/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendering for non admin users and not personal settings', () => {
    beforeEach(() => {
      setup({ url: '/account/gh/random', isAdmin: false })
    })

    it('renders the right links', () => {
      expect(
        screen.queryByRole('link', { name: /Admin/ })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /Access/ })
      ).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /YAML/ })).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: /billing & users/i })
      ).toBeInTheDocument()
    })
  })

  describe('when rendering for non admin users and is personal settings', () => {
    beforeEach(() => {
      setup({ url: '/account/gh/dorian', isAdmin: false })
    })

    it('renders the right links', () => {
      expect(
        screen.queryByRole('link', { name: /Admin/ })
      ).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /Access/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /YAML/ })).toBeInTheDocument()
      expect(
        screen.queryByRole('link', { name: /billing & users/i })
      ).not.toBeInTheDocument()
    })
  })
})
