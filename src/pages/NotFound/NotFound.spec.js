import { render, screen } from '@testing-library/react'
import NotFound from './NotFound'

describe('NotFound', () => {
  function setup(ToRender) {
    render(<NotFound />)
  }

  describe('renders', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the children', () => {
      expect(screen.getByText(/404/)).toBeInTheDocument()
    })
  })
})
