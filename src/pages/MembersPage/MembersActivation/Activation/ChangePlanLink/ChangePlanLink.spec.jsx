import { render, screen, waitFor } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import ChangePlanLink from './ChangePlanLink'

const wrapper =
  (initialEntries = ['/members/gh/critical-role']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo">{children}</Route>
      </MemoryRouter>
    )

describe('Members ChangePlanLink', () => {
  describe('When user is non enterprise', () => {
    it('Renders change plan link', async () => {
      const mockedAccountDetailsNonEnterprise = {
        plan: {
          value: 'users-basic',
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
          value: 'users-basic',
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
          value: 'users-enterprisem',
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
          value: 'users-pr-inappm',
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
