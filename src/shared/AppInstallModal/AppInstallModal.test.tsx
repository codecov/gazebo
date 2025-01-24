import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import AppInstallModal from './AppInstallModal'

afterEach(() => {
  vi.resetAllMocks()
})

describe('AppInstallModal', () => {
  const onClose = vi.fn()
  const onComplete = vi.fn()

  describe('when isOpen is false', () => {
    it('does not render', async () => {
      render(
        <AppInstallModal
          isOpen={false}
          onClose={onClose}
          onComplete={onComplete}
        />
      )

      const copy = screen.queryByText(/Copy the link below/)
      expect(copy).not.toBeInTheDocument()
    })
  })

  describe('when isOpen is true', () => {
    it('renders', async () => {
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      )

      const copy = await screen.findByText(/Copy the link below/)
      expect(copy).toBeInTheDocument()

      const snippet = await screen.findByText(
        /approve the installation of the Codecov app on GitHub for our organization?/
      )
      expect(snippet).toBeInTheDocument()
    })
  })

  describe('when modal is closed', () => {
    it('calls onClose', async () => {
      const user = userEvent.setup()
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      )

      const closeButton = await screen.findByTestId('modal-close-icon')
      expect(closeButton).toBeInTheDocument()

      expect(onClose).not.toHaveBeenCalled()

      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('when modal is "completed"', () => {
    it('calls onComplete', async () => {
      const user = userEvent.setup()
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      )

      const doneButton = await screen.findByTestId('close-modal')
      expect(doneButton).toBeInTheDocument()

      expect(onComplete).not.toHaveBeenCalled()

      await user.click(doneButton)

      expect(onComplete).toHaveBeenCalled()
    })
  })
})
