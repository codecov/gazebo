import { render, screen } from '@testing-library/react'

import UserManagerment from './UserManagement'

describe('UserManagerment', () => {
  function setup() {
    render(<UserManagerment />)
  }

  describe('initial load', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the user list', () => {
      const placeholder = screen.getByText(/User List/)
      expect(placeholder).toBeInTheDocument()
    })
  })
})
