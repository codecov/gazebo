import { render, screen } from '@testing-library/react'

import BillingAndUsers from './BillingAndUsers'

describe('BillingAndUsersTab', () => {
  function setup(url) {
    render(<BillingAndUsers />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders something', () => {
      const tab = screen.getByText(/Current plan/)
      expect(tab).toBeInTheDocument()
    })
  })
})
