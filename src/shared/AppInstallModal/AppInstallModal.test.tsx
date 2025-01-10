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

      expect(screen.getByText('Install Codecov app')).toBeInTheDocument()
      expect(
        screen.getByText(
          'You need to install Codecov app on your GitHub organization as an admin.'
        )
      ).toBeInTheDocument()

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(
        screen.getByText('Install Codecov app via GitHub')
      ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', async () => {
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      )

      await userEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onComplete when Install button is clicked', async () => {
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      )

      await userEvent.click(screen.getByText('Install Codecov app via GitHub'))
      expect(onComplete).toHaveBeenCalledTimes(1)
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

  describe('when modal is "cancelled"', () => {
    it('calls onClose', async () => {
      const user = userEvent.setup()
      render(
        <AppInstallModal
          isOpen={true}
          onClose={onClose}
          onComplete={onComplete}
        />
      )

      const installButton = await screen.findByTestId('close-modal')
      expect(installButton).toBeInTheDocument()

      expect(onComplete).not.toHaveBeenCalled()

      await user.click(installButton)

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

      const installButton = await screen.findByTestId('install-link')
      expect(installButton).toBeInTheDocument()

      expect(onComplete).not.toHaveBeenCalled()

      await user.click(installButton)

      expect(onComplete).toHaveBeenCalled()
    })
  })
})
