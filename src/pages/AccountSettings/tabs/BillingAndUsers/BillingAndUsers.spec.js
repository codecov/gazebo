import { render, screen } from '@testing-library/react'

import BillingAndUsers from './BillingAndUsers'
import { useAccountDetails } from 'services/account'

jest.mock('./CurrentPlanCard', () => () => 'CurrentPlanCard')
jest.mock('./LatestInvoiceCard', () => () => 'LatestInvoiceCard')
jest.mock('./PaymentCard', () => () => 'PaymentCard')
jest.mock('./InfoMessageCancellation', () => () => 'InfoMessageCancellation')
jest.mock('./UserManagement', () => () => 'UserManagement')
jest.mock('./InfoMessageStripeCallback', () => () =>
  'InfoMessageStripeCallback'
)
jest.mock('./LegacyUser', () => () => 'LegacyUser')
jest.mock('services/account/hooks')

const provider = 'gh'
const owner = 'codecov'

describe('BillingAndUsersTab', () => {
  const defaultAccountDetails = {
    plan: {},
  }
  function setup(userAccount = defaultAccountDetails) {
    useAccountDetails.mockReturnValue({
      data: userAccount,
    })
    render(<BillingAndUsers provider={provider} owner={owner} />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the CurrentPlanCard', () => {
      const tab = screen.getByText(/CurrentPlanCard/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the LatestInvoiceCard', () => {
      const tab = screen.getByText(/LatestInvoiceCard/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the PaymentCard', () => {
      const tab = screen.getByText(/PaymentCard/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the InfoMessageCancellation', () => {
      const tab = screen.getByText(/InfoMessageCancellation/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the InfoMessageStripeCallback', () => {
      const tab = screen.getByText(/InfoMessageStripeCallback/)
      expect(tab).toBeInTheDocument()
    })
    it('doesnt render the LegacyUser', () => {
      const tab = screen.queryByText(/LegacyUser/)
      expect(tab).not.toBeInTheDocument()
    })
  })

  describe('when the user is using github marketplace', () => {
    beforeEach(() => {
      setup({
        ...defaultAccountDetails,
        planProvider: 'github',
      })
    })

    it('renders the CurrentPlanCard', () => {
      const tab = screen.getByText(/CurrentPlanCard/)
      expect(tab).toBeInTheDocument()
    })

    it('doesnt render the LatestInvoiceCard', () => {
      const tab = screen.queryByText(/LatestInvoiceCard/)
      expect(tab).not.toBeInTheDocument()
    })

    it('doesnt render the PaymentCard', () => {
      const tab = screen.queryByText(/PaymentCard/)
      expect(tab).not.toBeInTheDocument()
    })
  })

  describe('when the owner is a gitlab subgroup', () => {
    beforeEach(() => {
      setup({
        ...defaultAccountDetails,
        rootOrganization: {
          username: 'something',
        },
      })
    })

    it('renders the CurrentPlanCard', () => {
      const tab = screen.getByText(/CurrentPlanCard/)
      expect(tab).toBeInTheDocument()
    })

    it('doesnt render the LatestInvoiceCard', () => {
      const tab = screen.queryByText(/LatestInvoiceCard/)
      expect(tab).not.toBeInTheDocument()
    })

    it('doesnt render the PaymentCard', () => {
      const tab = screen.queryByText(/PaymentCard/)
      expect(tab).not.toBeInTheDocument()
    })
  })

  describe('when the user is on a legacy plan', () => {
    beforeEach(() => {
      setup({
        plan: null,
      })
    })

    it('renders the LegacyUser', () => {
      const tab = screen.getByText(/LegacyUser/)
      expect(tab).toBeInTheDocument()
    })

    it('doesnt renders the CurrentPlanCard', () => {
      const tab = screen.queryByText(/CurrentPlanCard/)
      expect(tab).not.toBeInTheDocument()
    })

    it('doesnt renders the LatestInvoiceCard', () => {
      const tab = screen.queryByText(/LatestInvoiceCard/)
      expect(tab).not.toBeInTheDocument()
    })

    it('doesnt renders the PaymentCard', () => {
      const tab = screen.queryByText(/PaymentCard/)
      expect(tab).not.toBeInTheDocument()
    })
  })
})
