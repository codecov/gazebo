import { render, screen } from '@testing-library/react'

import Admin from './Admin'

describe('AdminTab', () => {
  function setup(url) {
    render(<Admin />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders something', () => {
      const tab = screen.getByText(/Admin/)
      expect(tab).toBeInTheDocument()
    })
  })
})
