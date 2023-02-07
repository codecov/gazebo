import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import TruncatedMessage from './TruncatedMessage'

const longMessage =
  'In id magna dolor reprehenderit Lorem anim incididunt excepteur occaecat. Enim elit exercitation labore ut qui ad deserunt irure irure. Non magna et deserunt quis tempor cillum velit cupidatat irure irure. Non magna et deserunt quis tempor cillum velit else.'

describe('TruncatedMessage', () => {
  describe('When commit message is less than a line', () => {
    it('renders the the full message', () => {
      render(<TruncatedMessage message={'This is a short message'} />)

      const msg = screen.getByText(/This is a short message/)
      expect(msg).toBeInTheDocument()
    })

    it('hides the truncate button', () => {
      const btn = screen.queryByText(/see more/)
      expect(btn).not.toBeInTheDocument()
    })
  })

  describe('When commit message is longer than a line', () => {
    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        Configurable: true,
        value: 500,
      })
    })

    it('has scrollWidth of 500', () => {
      render(<TruncatedMessage message={longMessage} />)

      const msg = screen.getByTestId('truncate-message-pre')
      expect(msg).toHaveProperty('scrollWidth', 500)
    })

    it('adds line-clamp-1 class to truncate message pre tag', () => {
      render(<TruncatedMessage message={longMessage} />)

      const msg = screen.getByTestId('truncate-message-pre')
      expect(msg).toHaveClass('line-clamp-1')
    })

    it('renders the expand button', () => {
      render(<TruncatedMessage message={longMessage} />)

      const expandBtn = screen.getByText(/see more/)
      expect(expandBtn).toBeInTheDocument()
    })
  })

  describe('Check truncate buttons', () => {
    beforeEach(() => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
        Configurable: true,
        value: 500,
      })
    })

    it('renders the collapse button', () => {
      render(<TruncatedMessage message={longMessage} />)

      const btn = screen.getByText('see more')
      userEvent.click(btn)

      const seeLessBtn = screen.getByText(/see less/)
      expect(seeLessBtn).toBeInTheDocument()
    })

    it('renders the expand button', () => {
      render(<TruncatedMessage message={longMessage} />)

      const seeMoreBtn = screen.getByText('see more')
      userEvent.click(seeMoreBtn)

      const seeLessBtn = screen.getByText('see less')
      userEvent.click(seeLessBtn)

      const seeMoreBtn2 = screen.getByText(/see more/)
      expect(seeMoreBtn2).toBeInTheDocument()
    })
  })
})
