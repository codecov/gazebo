import { render, screen, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Header from './Header'

describe('Header', () => {
  function setup() {
    render(
      <MemoryRouter>
        <div>
          <Header />
          <p data-testid="outside-content">Content</p>
        </div>
      </MemoryRouter>
    )
  }

  describe('mobile menu button', () => {
    beforeEach(() => {
      setup()
    })

    it('renders hamburger when closed', () => {
      expect(screen.getByTestId('hamburger-icon')).not.toHaveClass('hidden')
      expect(screen.getByTestId('times-icon')).toHaveClass('hidden')
    })

    it('renders times when open', () => {
      const toggle = screen.getByTestId('toggle-mobile')

      // Open menu
      act(() => {
        toggle.click()
      })

      expect(screen.getByTestId('hamburger-icon')).toHaveClass('hidden')
      expect(screen.getByTestId('times-icon')).not.toHaveClass('hidden')
    })
  })

  describe('mobile menu', () => {
    beforeEach(() => {
      setup()
    })

    it('opens the mobile menu', () => {
      const toggle = screen.getByTestId('toggle-mobile')

      expect(screen.queryByTestId('mobile-menu')).toBeNull()

      act(() => {
        toggle.click()
      })

      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
    })

    it('clicking outside of header closes the mobile menu', () => {
      const toggle = screen.getByTestId('toggle-mobile')
      const outsideContent = screen.getByTestId('outside-content')

      expect(screen.queryByTestId('mobile-menu')).toBeNull()

      act(() => {
        toggle.click()
      })

      fireEvent.mouseDown(outsideContent)
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument()
    })
  })
})
