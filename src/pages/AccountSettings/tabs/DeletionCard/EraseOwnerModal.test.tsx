import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EraseOwnerModal from './EraseOwnerModal'

describe('EraseOwnerModal', () => {
  function setup() {
    return { user: userEvent.setup() }
  }

  it('renders the irreversible warning', () => {
    render(
      <EraseOwnerModal
        isPersonalSettings={true}
        ownerName="test-user"
        isLoading={false}
        showModal={true}
        closeModal={vi.fn()}
        eraseOwner={vi.fn()}
      />
    )

    expect(
      screen.getByText(/Warning: this action is not reversible/i)
    ).toBeInTheDocument()
  })

  it('renders the sign-out and new account note', () => {
    render(
      <EraseOwnerModal
        isPersonalSettings={true}
        ownerName="test-user"
        isLoading={false}
        showModal={true}
        closeModal={vi.fn()}
        eraseOwner={vi.fn()}
      />
    )

    expect(
      screen.getByText(/You will be signed out when deletion begins/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/a new account will be created/i)
    ).toBeInTheDocument()
  })

  it('does not render when showModal is false', () => {
    render(
      <EraseOwnerModal
        isPersonalSettings={true}
        ownerName="test-user"
        isLoading={false}
        showModal={false}
        closeModal={vi.fn()}
        eraseOwner={vi.fn()}
      />
    )

    expect(
      screen.queryByText(/Warning: this action is not reversible/i)
    ).not.toBeInTheDocument()
  })

  describe('confirmation input', () => {
    it('keeps the confirm button disabled until the checkbox is checked and owner name is typed', async () => {
      const { user } = setup()
      const eraseOwner = vi.fn()
      render(
        <EraseOwnerModal
          isPersonalSettings={true}
          ownerName="test-user"
          isLoading={false}
          showModal={true}
          closeModal={vi.fn()}
          eraseOwner={eraseOwner}
        />
      )

      const confirmButton = screen.getByTestId('erase-owner-content')
      expect(confirmButton).toBeDisabled()

      const input = screen.getByPlaceholderText('test-user')
      await user.type(input, 'test-user')
      expect(confirmButton).toBeDisabled()

      await user.click(screen.getByTestId('erase-owner-confirmation-checkbox'))
      expect(confirmButton).toBeEnabled()
    })

    it('keeps the confirm button disabled when only the checkbox is checked', async () => {
      const { user } = setup()
      render(
        <EraseOwnerModal
          isPersonalSettings={true}
          ownerName="test-user"
          isLoading={false}
          showModal={true}
          closeModal={vi.fn()}
          eraseOwner={vi.fn()}
        />
      )

      const confirmButton = screen.getByTestId('erase-owner-content')
      await user.click(screen.getByTestId('erase-owner-confirmation-checkbox'))
      expect(confirmButton).toBeDisabled()
    })

    it('calls eraseOwner when confirmed and clicked', async () => {
      const { user } = setup()
      const eraseOwner = vi.fn()
      render(
        <EraseOwnerModal
          isPersonalSettings={false}
          ownerName="my-org"
          isLoading={false}
          showModal={true}
          closeModal={vi.fn()}
          eraseOwner={eraseOwner}
        />
      )

      await user.click(screen.getByTestId('erase-owner-confirmation-checkbox'))
      await user.type(screen.getByPlaceholderText('my-org'), 'my-org')

      await user.click(screen.getByTestId('erase-owner-content'))

      await waitFor(() => expect(eraseOwner).toHaveBeenCalled())
    })
  })

  describe('when isPersonalSettings is false', () => {
    it('uses organization wording', () => {
      render(
        <EraseOwnerModal
          isPersonalSettings={false}
          ownerName="my-org"
          isLoading={false}
          showModal={true}
          closeModal={vi.fn()}
          eraseOwner={vi.fn()}
        />
      )

      expect(
        screen.getByRole('heading', { name: 'Delete organization' })
      ).toBeInTheDocument()
    })
  })

  it('calls closeModal when cancel is clicked', async () => {
    const { user } = setup()
    const closeModal = vi.fn()
    render(
      <EraseOwnerModal
        isPersonalSettings={true}
        ownerName="test-user"
        isLoading={false}
        showModal={true}
        closeModal={closeModal}
        eraseOwner={vi.fn()}
      />
    )

    await user.click(screen.getByTestId('close-modal'))
    expect(closeModal).toHaveBeenCalled()
  })
})
