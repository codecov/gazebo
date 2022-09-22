import { render, screen } from '@testing-library/react'

import TokenWrapper from './TokenWrapper'

describe('TokenWrapper', () => {
  function setup({ truncate = false, token }) {
    render(<TokenWrapper token={token} truncate={truncate} />)
  }

  describe('public scope', () => {
    beforeEach(() => {
      setup({ token: 'randomToken' })
    })
    it('renders the token', () => {
      expect(screen.getByText(/randomToken/)).toBeInTheDocument()
    })
    it('renders a copy button', () => {
      expect(screen.getByText(/clipboard-copy.svg/)).toBeInTheDocument()
    })
  })

  describe('public scope with truncated token', () => {
    beforeEach(() => {
      setup({
        token:
          'Nostrud tempor irure id consequat cupidatat exercitation ex mollit.',
        truncate: true,
      })
    })
    it('renders truncated token', () => {
      expect(screen.getByText(/Nostrud tempor .../)).toBeInTheDocument()
    })
  })
})
