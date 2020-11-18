import { render, screen } from '@testing-library/react'

import BillingAndUsers from './BillingAndUsers'
import { useAccountDetails } from 'services/account'

jest.mock('./CurrentPlanCard', () => () => 'CurrentPlanCard')
jest.mock('services/account/hooks')

const provider = 'gh'
const owner = 'codecov'

describe('BillingAndUsersTab', () => {
  function setup(url) {
    useAccountDetails.mockReturnValue({
      data: null,
    })
    render(<BillingAndUsers provider={provider} owner={owner} />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders the CurrentPlanCard', () => {
      const tab = screen.getByText(/CurrentPlanCard/)
      expect(tab).toBeInTheDocument()
    })
  })
})
