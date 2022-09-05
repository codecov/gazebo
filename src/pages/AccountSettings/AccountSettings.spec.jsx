import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useIsCurrentUserAnAdmin, useUser } from 'services/user'
import { useFlags } from 'shared/featureFlags'

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
jest.mock('shared/featureFlags')

describe('AccountSettings', () => {
  function setup({ url, isAdmin, gazeboPlanTab = false }) {
    useUser.mockReturnValue({
      data: {
        user: {
          username: 'dorian',
        },
      },
    })
    useFlags.mockReturnValue({
      gazeboPlanTab,
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

  describe('when flag is on and user in an admin', () => {
    beforeEach(() => {
      setup({ url: '/account/gh/dorian', isAdmin: true, gazeboPlanTab: true })
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

  describe('when flag is on and account is not personal', () => {
    beforeEach(() => {
      setup({ url: '/account/gh/rula', isAdmin: false, gazeboPlanTab: true })
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
        screen.queryByRole('link', { name: /billing & users/i })
      ).not.toBeInTheDocument()
    })
  })
})
