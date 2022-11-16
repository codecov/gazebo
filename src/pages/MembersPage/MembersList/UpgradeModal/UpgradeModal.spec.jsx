import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import UpgradeModal from './UpgradeModal'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov']}>
    <Route path="/:provider/:owner">{children}</Route>
  </MemoryRouter>
)

describe('UpgradeModal', () => {
  const setIsOpen = jest.fn()
  const defaultProps = {
    isOpen: true,
    setIsOpen: setIsOpen,
  }

  describe('rendering UpgradeModal', () => {
    it('renders the title', () => {
      render(<UpgradeModal {...defaultProps} />, { wrapper })

      const title = screen.getByText('Upgrade to Pro')
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      render(<UpgradeModal {...defaultProps} />, { wrapper })

      const firstParagraph = screen.getByText(/maximum number of free users/i)
      expect(firstParagraph).toBeInTheDocument()

      const contactLink = screen.getByRole('link', { name: /Contact/i })
      expect(contactLink).toBeInTheDocument()
      expect(contactLink).toHaveAttribute(
        'href',
        'https://about.codecov.io/sales'
      )
    })

    it('renders footer', () => {
      render(<UpgradeModal {...defaultProps} />, { wrapper })

      const cancel = screen.getByRole('button', { name: 'Cancel' })
      expect(cancel).toBeInTheDocument()

      const upgrade = screen.getByRole('link', { name: 'Upgrade now' })
      expect(upgrade).toBeInTheDocument()
      expect(upgrade).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })
  })

  describe('when interacting with the modal', () => {
    describe('when clicking x', () => {
      it('calls setIsOpen', () => {
        render(<UpgradeModal {...defaultProps} />, { wrapper })

        const close = screen.getByLabelText('Close')
        userEvent.click(close)

        expect(setIsOpen).toBeCalledWith(false)
      })
    })

    describe('when clicking cancel', () => {
      it('calls setIsOpen', () => {
        render(<UpgradeModal {...defaultProps} />, { wrapper })

        const cancel = screen.getByRole('button', { name: 'Cancel' })
        userEvent.click(cancel)

        expect(setIsOpen).toBeCalledWith(false)
      })
    })
  })
})
