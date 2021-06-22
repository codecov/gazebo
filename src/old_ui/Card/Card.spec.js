import { render, screen } from '@testing-library/react'

import Card from './Card'

describe('Card', () => {
  function setup(props) {
    render(<Card {...props} />)
  }

  describe('when rendered with children', () => {
    beforeEach(() => {
      setup({ children: 'hello' })
    })

    it('renders the children', () => {
      const tab = screen.getByText(/hello/)
      expect(tab).toBeInTheDocument()
    })
  })
})
