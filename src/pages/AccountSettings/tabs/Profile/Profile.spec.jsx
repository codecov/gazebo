import { render, screen } from '@testing-library/react'

import Profile from './Profile'

describe('Profile', () => {
  function setup() {
    render(<Profile />)
  }
  describe('rendering component', () => {
    beforeEach(() => setup())

    it('renders profile', () => {
      const text = screen.getByText('Profile')
      expect(text).toBeInTheDocument()
    })
  })
})
