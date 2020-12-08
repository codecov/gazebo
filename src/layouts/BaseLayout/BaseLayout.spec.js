import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import BaseLayout from './BaseLayout'

describe('BaseLayout', () => {
  function setup(props) {
    render(<BaseLayout {...props} />, {
      wrapper: MemoryRouter,
    })
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup({
        children: 'hello',
      })
    })

    it('renders the children', () => {
      expect(screen.getByText(/hello/)).toBeInTheDocument()
    })
  })
})
