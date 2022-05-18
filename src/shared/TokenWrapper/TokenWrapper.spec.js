import { render, screen } from '@testing-library/react'

import TokenWrapper from './TokenWrapper'

describe('TokenWrapper', () => {
  function setup() {
    render(<TokenWrapper uploadToken="randomToken" />)
  }

  describe('public scope', () => {
    beforeEach(() => {
      setup()
    })
    it('renders the token', () => {
      expect(screen.getByText(/randomToken/)).toBeInTheDocument()
    })
    it('renders a copy button', () => {
      expect(screen.getByText(/clipboard-copy.svg/)).toBeInTheDocument()
    })
  })
})
