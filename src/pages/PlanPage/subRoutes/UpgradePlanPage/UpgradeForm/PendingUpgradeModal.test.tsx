import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PendingUpgradeModal from './PendingUpgradeModal'

describe('PendingUpgradeModal', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()
  const mockUrl = 'https://verify.stripe.com'

  const setup = (isUpgrading = false) => {
    return render(
      <PendingUpgradeModal
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        url={mockUrl}
        isUpgrading={isUpgrading}
      />
    )
  }

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders modal with correct content', () => {
    setup()

    expect(screen.getByText('Incomplete Plan Upgrade')).toBeInTheDocument()
    expect(
      screen.getByText(
        /You have a pending plan upgrade awaiting payment verification/
      )
    ).toBeInTheDocument()
    expect(screen.getByText('here')).toHaveAttribute('href', mockUrl)
    expect(
      screen.getByText(
        /Are you sure you want to abandon this upgrade and start a new one/
      )
    ).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', async () => {
    setup()
    const utils = userEvent.setup()

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await utils.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    setup()
    const utils = userEvent.setup()

    const confirmButton = screen.getByRole('button', {
      name: 'Yes, Start New Upgrade',
    })
    await utils.click(confirmButton)

    expect(mockOnConfirm).toHaveBeenCalled()
  })

  describe('when isUpgrading is true', () => {
    it('disables buttons and shows processing text', () => {
      setup(true)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      const confirmButton = screen.getByRole('button', {
        name: 'Processing...',
      })

      expect(cancelButton).toBeDisabled()
      expect(confirmButton).toBeDisabled()
    })
  })
})
