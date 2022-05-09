import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import TruncatedMessage from './TruncatedMessage'

const longMessage =
  'In id magna dolor reprehenderit Lorem anim incididunt excepteur occaecat. Enim elit exercitation labore ut qui ad deserunt irure irure. Non magna et deserunt quis tempor cillum velit cupidatat irure irure. Non magna et deserunt quis tempor cillum velit else.'

describe('TruncatedMessage', () => {
  function setup({ message }) {
    render(<TruncatedMessage message={message} />)
  }

  describe('When commit message is less than a line', () => {
    beforeEach(() => {
      setup({ message: 'This is a short message' })
    })

    it('renders the the full message', () => {
      expect(screen.getByText(/This is a short message/)).toBeInTheDocument()
    })

    it('hides the truncate button', () => {
      expect(screen.queryByText(/see more/)).not.toBeInTheDocument()
    })
  })

  it('should mock ref and offsetWidth', () => {
    setup({ message: longMessage })
  })

  describe('When commit message is longer than a line', () => {
    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 500,
      })
      setup({ message: longMessage })
    })

    it('has scrollWidth of 500', () => {
      expect(screen.getByTestId('truncate-message')).toHaveProperty(
        'scrollWidth',
        500
      )
    })
    it('adds line-clamp-1 class to truncate message pre tag', () => {
      expect(screen.getByTestId('truncate-message')).toHaveClass('line-clamp-1')
    })

    it('renders the expand button', () => {
      expect(screen.getByText(/see more/)).toBeInTheDocument()
    })
  })

  describe('Check truncate buttons', () => {
    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        configurable: true,
        value: 500,
      })

      setup({ message: longMessage })
      const btn = screen.getByText('see more')
      fireEvent.click(btn)
    })

    it('renders the collapse button', () => {
      expect(screen.getByText(/see less/)).toBeInTheDocument()
    })

    it('renders the expand button', () => {
      const btn = screen.getByText('see less')
      fireEvent.click(btn)
      expect(screen.getByText(/see more/)).toBeInTheDocument()
    })
  })
})
