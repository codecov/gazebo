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
  function setup() {
    const user = userEvent.setup()

    return { user }
  }
  describe('rendering UpgradeModal', () => {
    it('renders the title', () => {
      const setIsOpen = vi.fn()
      render(<UpgradeModal isOpen={true} setIsOpen={setIsOpen} />, { wrapper })

      const title = screen.getByText('Upgrade to Pro')
      expect(title).toBeInTheDocument()
    })

    it('renders body', () => {
      const setIsOpen = vi.fn()
      render(<UpgradeModal isOpen={true} setIsOpen={setIsOpen} />, { wrapper })

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
      const setIsOpen = vi.fn()
      render(<UpgradeModal isOpen={true} setIsOpen={setIsOpen} />, { wrapper })

      const cancel = screen.getByRole('button', { name: 'Cancel' })
      expect(cancel).toBeInTheDocument()

      const upgrade = screen.getByRole('link', { name: 'Upgrade now' })
      expect(upgrade).toBeInTheDocument()
      expect(upgrade).toHaveAttribute('href', '/plan/gh/codecov/upgrade')
    })
  })

  describe('when interacting with the modal', () => {
    describe('when clicking x', () => {
      it('calls setIsOpen', async () => {
        const { user } = setup()
        const setIsOpen = vi.fn()
        render(<UpgradeModal isOpen={true} setIsOpen={setIsOpen} />, {
          wrapper,
        })

        const close = screen.getByLabelText('Close')
        await user.click(close)

        expect(setIsOpen).toHaveBeenCalledWith(false)
      })
    })

    describe('when clicking cancel', () => {
      it('calls setIsOpen', async () => {
        const { user } = setup()
        const setIsOpen = vi.fn()
        render(<UpgradeModal isOpen={true} setIsOpen={setIsOpen} />, {
          wrapper,
        })

        const cancel = screen.getByRole('button', { name: 'Cancel' })
        await user.click(cancel)

        expect(setIsOpen).toHaveBeenCalledWith(false)
      })
    })
  })
})
