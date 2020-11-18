import { render, screen } from '@testing-library/react'

import BillingAndUsers from './BillingAndUsers'

jest.mock('./CurrentPlanCard', () => () => 'CurrentPlanCard')

describe('BillingAndUsersTab', () => {
  function setup(url) {
    render(<BillingAndUsers />)
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
