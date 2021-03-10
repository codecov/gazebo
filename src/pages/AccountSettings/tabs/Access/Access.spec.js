import { render, screen } from '@testing-library/react'

import Access from './Access'

describe('AccessTab', () => {
  function setup(url) {
    render(<Access />)
  }

  describe('when rendering on base url', () => {
    beforeEach(() => {
      setup('/')
    })

    it('renders something', () => {
      const tab = screen.getByText(/Access/)
      expect(tab).toBeInTheDocument()
    })
  })
})
