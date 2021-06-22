import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUser } from 'services/user'
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
  function setup(url = '/account/gh/codecov') {
    useUser.mockReturnValue({
      data: {
        username: 'dorian',
      },
    })
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
      setup()
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

  describe('when rendering for personal settings', () => {
    beforeEach(() => {
      setup('/account/gh/dorian')
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
})
