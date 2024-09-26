import { render, screen } from '@testing-library/react'

import TokenWrapper from './TokenWrapper'

describe('TokenWrapper', () => {
  describe('public scope', () => {
    it('renders the token', () => {
      render(<TokenWrapper token="randomToken" />)

      const token = screen.getByText(/randomToken/)
      expect(token).toBeInTheDocument()
    })

    it('renders a copy button', () => {
      render(<TokenWrapper token="randomToken" />)

      const copyButton = screen.getByTestId('clipboardCopy')
      expect(copyButton).toBeInTheDocument()
    })
  })

  describe('public scope with truncated token', () => {
    it('renders truncated token', () => {
      const token =
        'Nostrud tempor irure id consequat cupidatat exercitation ex mollit.'
      render(<TokenWrapper token={token} truncate={true} />)

      const text = screen.getByText(/Nostrud tempor .../)
      expect(text).toBeInTheDocument()
    })
  })
})
