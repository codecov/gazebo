import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { Plans } from 'shared/utils/billing'

import ChangePlanLink from './ChangePlanLink'

const wrapper =
  (initialEntries = ['/members/gh/critical-role']) =>
  ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  )

describe('Members ChangePlanLink', () => {
  describe('When user is non enterprise', () => {
    it('Renders change plan link', async () => {
      const mockedAccountDetailsNonEnterprise = {
        plan: {
          value: Plans.USERS_BASIC,
        },
        subscriptionDetail: {
          collectionMethod: 'paid',
        },
      }
      render(
        <ChangePlanLink accountDetails={mockedAccountDetailsNonEnterprise} />,
        { wrapper: wrapper() }
      )

      const changePlanLink = await screen.findByRole('link', {
        href: '/account/bb/critical-role/billing/upgrade',
      })
      expect(changePlanLink).toBeInTheDocument()
    })
  })

  describe('When config is enterprise', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
    })

    it('Does not render change plan link', async () => {
      const mockedAccountDetailsNonEnterprise = {
        plan: {
          value: Plans.USERS_BASIC,
        },
        subscriptionDetail: {
          collectionMethod: 'paid',
        },
      }
      render(
        <ChangePlanLink accountDetails={mockedAccountDetailsNonEnterprise} />,
        { wrapper: wrapper() }
      )

      await waitFor(() => {
        expect(screen.queryByText(/change plan/)).not.toBeInTheDocument()
      })
    })
  })

  describe('When user has enterprise plan', () => {
    it('Does not render change plan link', async () => {
      const mockedAccountDetailsEnterprise = {
        plan: {
          value: Plans.USERS_ENTERPRISE,
        },
        subscriptionDetail: {
          collectionMethod: 'paid',
        },
      }
      render(
        <ChangePlanLink accountDetails={mockedAccountDetailsEnterprise} />,
        { wrapper: wrapper() }
      )

      await waitFor(() => {
        expect(screen.queryByText(/change plan/)).not.toBeInTheDocument()
      })
    })
  })

  describe('When user is invoiced user', () => {
    it('Does not render change plan link', async () => {
      const mockedAccountDetailsInvoiceUser = {
        plan: {
          value: Plans.USERS_PR_INAPPM,
        },
        subscriptionDetail: {
          collectionMethod: 'send_invoice',
        },
      }
      render(
        <ChangePlanLink accountDetails={mockedAccountDetailsInvoiceUser} />,
        { wrapper: wrapper() }
      )

      await waitFor(() => {
        expect(screen.queryByText(/change plan/)).not.toBeInTheDocument()
      })
    })
  })
})
