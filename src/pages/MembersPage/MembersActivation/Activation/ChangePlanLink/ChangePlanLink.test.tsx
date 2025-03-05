import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import config from 'config'

import { AccountDetailsSchema } from 'services/account/useAccountDetails'
import { Plan } from 'services/account/usePlanData'

import ChangePlanLink from './ChangePlanLink'

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/members/gh/critical-role']}>
    <Route path="/:provider/:owner/:repo">{children}</Route>
  </MemoryRouter>
)

describe('Members ChangePlanLink', () => {
  describe('When user is non enterprise', () => {
    it('Renders change plan link', async () => {
      const mockedAccountDetailsNonEnterprise = {
        subscriptionDetail: {
          collectionMethod: 'paid',
        },
      } as z.infer<typeof AccountDetailsSchema>
      const mockedPlan = {
        isEnterprisePlan: false,
      } as Plan
      render(
        <ChangePlanLink
          accountDetails={mockedAccountDetailsNonEnterprise}
          plan={mockedPlan}
        />,
        { wrapper }
      )

      const changePlanLink = await screen.findByRole('link', {
        name: 'change plan',
      })
      expect(changePlanLink).toBeInTheDocument()
    })
  })

  describe('When config is self hosted', () => {
    beforeEach(() => {
      config.IS_SELF_HOSTED = true
    })

    it('Does not render change plan link', async () => {
      const mockedAccountDetailsNonEnterprise = {
        subscriptionDetail: {
          collectionMethod: 'paid',
        },
      } as z.infer<typeof AccountDetailsSchema>
      const mockedPlan = {
        isEnterprisePlan: false,
      } as Plan

      render(
        <ChangePlanLink
          accountDetails={mockedAccountDetailsNonEnterprise}
          plan={mockedPlan}
        />,
        { wrapper }
      )

      await waitFor(() => {
        expect(screen.queryByText(/change plan/)).not.toBeInTheDocument()
      })
    })
  })

  describe('When user has enterprise plan', () => {
    it('Does not render change plan link', async () => {
      const mockedAccountDetailsEnterprise = {
        subscriptionDetail: {
          collectionMethod: 'paid',
        },
      } as z.infer<typeof AccountDetailsSchema>
      const mockedPlan = {
        isEnterprisePlan: true,
      } as Plan

      render(
        <ChangePlanLink
          accountDetails={mockedAccountDetailsEnterprise}
          plan={mockedPlan}
        />,
        { wrapper }
      )

      await waitFor(() => {
        expect(screen.queryByText(/change plan/)).not.toBeInTheDocument()
      })
    })
  })

  describe('When user is invoiced user', () => {
    it('Does not render change plan link when send_invoice', async () => {
      const mockedAccountDetailsInvoiceUser = {
        subscriptionDetail: {
          collectionMethod: 'send_invoice',
        },
      } as z.infer<typeof AccountDetailsSchema>
      const mockedPlan = {
        isEnterprisePlan: false,
      } as Plan

      render(
        <ChangePlanLink
          accountDetails={mockedAccountDetailsInvoiceUser}
          plan={mockedPlan}
        />,
        { wrapper }
      )

      await waitFor(() => {
        expect(screen.queryByText(/change plan/)).not.toBeInTheDocument()
      })
    })
    it('Does not render change plan link when usesInvoice', async () => {
      const mockedAccountDetailsInvoiceUser = {
        usesInvoice: true,
      } as z.infer<typeof AccountDetailsSchema>
      const mockedPlan = {
        isEnterprisePlan: false,
      } as Plan

      render(
        <ChangePlanLink
          accountDetails={mockedAccountDetailsInvoiceUser}
          plan={mockedPlan}
        />,
        { wrapper }
      )

      await waitFor(() => {
        expect(screen.queryByText(/change plan/)).not.toBeInTheDocument()
      })
    })
  })
})
